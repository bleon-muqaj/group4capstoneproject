use warp::Filter;
use warp::http::Method;
use serde::{Deserialize, Serialize};
use mimic_emulator::mips32::assembler::assemble_from_file;
use mimic_emulator::mips32::core::Core;
use std::fs;

#[derive(Deserialize)]
struct AssembleRequest {
    code: String,
}

#[derive(Serialize)]
struct AssembleResponse {
    machine_code: String,
    errors: Option<String>,
    execution_status: String,
    syscall_output: Option<String>,
    register_dump: Option<[u32; 32]>,
    text_dump: Option<String>,
    data_dump: Option<String>,
    text_dump_friendly: Option<String>,
    data_dump_friendly: Option<String>,
}

#[tokio::main]
async fn main() {
    let cors = warp::cors()
        .allow_any_origin()
        .allow_headers(vec!["Content-Type"])
        .allow_methods(vec![Method::POST, Method::OPTIONS]);

    let assemble_route = warp::post()
        .and(warp::path("assemble"))
        .and(warp::body::json())
        .map(|req: AssembleRequest| {
            let tmp_filename = "temp_input.asm";
            if let Err(e) = fs::write(tmp_filename, &req.code) {
                return warp::reply::json(&AssembleResponse {
                    machine_code: "".to_string(),
                    errors: Some(format!("Error writing temporary file: {}", e)),
                    execution_status: "Failed".to_string(),
                    syscall_output: None,
                    register_dump: None,
                    text_dump: None,
                    data_dump: None,
                    text_dump_friendly: None,
                    data_dump_friendly: None,
                });
            }

            match assemble_from_file(tmp_filename) {
                Ok((text_bytes, data_bytes)) => {
                    let text_words = bytes_to_words(text_bytes.clone());
                    let mut machine_code = String::new();
                    for word in &text_words {
                        machine_code.push_str(&format!("{:#010X}\n", word));
                    }

                    let text_dump = dump_hex_only(&text_bytes, 0x00400000);
                    let text_dump_friendly = dump_4cols_reversed(&text_bytes);

                    let mut data_bytes_padded = data_bytes.clone();
                    if data_bytes_padded.len() % 4 != 0 {
                        let pad = 4 - (data_bytes_padded.len() % 4);
                        data_bytes_padded.extend(std::iter::repeat(0).take(pad));
                    }
                    let data_dump = dump_hex_only(&data_bytes_padded, 0x10010000);
                    let data_dump_friendly = dump_4cols_reversed(&data_bytes_padded);

                    let mut core = Core::new_mips_default();
                    core.load_text(text_words);
                    let data_words: Vec<u32> = data_bytes_padded.into_iter().map(|b| b as u32).collect();
                    core.load_data(data_words);

                    let max_ticks = 100;
                    let mut sys_out = String::new();
                    let mut string_addr: Option<u32> = None;
                    for _ in 0..max_ticks {
                        if let Err(e) = core.tick(|_inst, regs| {
                            match regs[2] {
                                1 => {
                                    sys_out.push_str(&format!("{}\n", regs[4]));
                                }
                                4 => {
                                    string_addr = Some(regs[4]);
                                    sys_out.push_str("<pending>\n");
                                }
                                10 => {
                                    sys_out.push_str("Exit syscall encountered\n");
                                }
                                other => {
                                    sys_out.push_str(&format!("Unhandled syscall: {}\n", other));
                                }
                            }
                            regs
                        }) {
                            return warp::reply::json(&AssembleResponse {
                                machine_code: machine_code.clone(),
                                errors: Some(format!("Execution error: {}", e)),
                                execution_status: "Failed".to_string(),
                                syscall_output: None,
                                register_dump: None,
                                text_dump: None,
                                data_dump: None,
                                text_dump_friendly: None,
                                data_dump_friendly: None,
                            });
                        }
                    }
                    if let Some(addr) = string_addr {
                        let printed_string = read_string(&core, addr);
                        sys_out = sys_out.replace("<pending>", &printed_string);
                    }
                    let reg_dump = core.dump_registers();

                    warp::reply::json(&AssembleResponse {
                        machine_code,
                        errors: None,
                        execution_status: "Completed".to_string(),
                        syscall_output: Some(sys_out),
                        register_dump: Some(reg_dump),
                        text_dump: Some(text_dump),
                        data_dump: Some(data_dump),
                        text_dump_friendly: Some(text_dump_friendly),
                        data_dump_friendly: Some(data_dump_friendly),
                    })
                },
                Err(e) => {
                    warp::reply::json(&AssembleResponse {
                        machine_code: "".to_string(),
                        errors: Some(format!("Error assembling code: {}", e)),
                        execution_status: "Failed".to_string(),
                        syscall_output: None,
                        register_dump: None,
                        text_dump: None,
                        data_dump: None,
                        text_dump_friendly: None,
                        data_dump_friendly: None,
                    })
                }
            }
        })
        .with(cors);

    println!("Server running at http://127.0.0.1:3030");
    warp::serve(assemble_route).run(([127, 0, 0, 1], 3030)).await;
}

fn bytes_to_words(bytes: Vec<u8>) -> Vec<u32> {
    let mut words = Vec::new();
    for i in 0..(bytes.len() / 4) {
        let word = (bytes[i * 4] as u32)
            | ((bytes[i * 4 + 1] as u32) << 8)
            | ((bytes[i * 4 + 2] as u32) << 16)
            | ((bytes[i * 4 + 3] as u32) << 24);
        words.push(word);
    }
    words
}

fn dump_hex_only(bytes: &Vec<u8>, base_address: u32) -> String {
    let mut s = String::new();
    let len = bytes.len();
    for chunk in bytes.chunks(4) {
        let mut word: u32 = 0;
        for (i, &b) in chunk.iter().enumerate() {
            word |= (b as u32) << (i * 8);
        }
        s.push_str(&format!("0x{:08X}\n", word));
    }
    s
}

fn dump_bytes_with_ascii(bytes: &Vec<u8>, base_address: u32) -> String {
    let mut s = String::new();
    let len = bytes.len();
    for line_start in (0..len).step_by(16) {
        let addr = base_address + line_start as u32;
        s.push_str(&format!("{:#010X}: ", addr));

        let mut hex_part = String::new();
        let mut ascii_part = String::new();

        for offset in 0..16 {
            if line_start + offset < len {
                let b = bytes[line_start + offset];
                hex_part.push_str(&format!("{:02X} ", b));
                ascii_part.push_str(&render_char(b));
            } else {
                hex_part.push_str("   ");
                ascii_part.push(' ');
            }
        }
        s.push_str(&format!("{} {}\n", hex_part, ascii_part));
    }
    s
}

fn render_char(byte: u8) -> String {
    match byte {
        0x20..=0x7E => (byte as char).to_string(),
        b'\n' => "\\n".to_string(),
        b'\r' => "\\r".to_string(),
        b'\t' => "\\t".to_string(),
        0x00 => "\\0".to_string(),
        _ => ".".to_string(),
    }
}

fn dump_4cols_reversed(bytes: &[u8]) -> String {
    let mut s = String::new();
    let len = bytes.len();
    for row in 0..((len + 3) / 4) {
        let start = row * 4;
        let mut group: Vec<u8> = bytes[start..std::cmp::min(start + 4, len)].to_vec();
        group.reverse();
        for b in group {
            s.push_str(&format!("{:4}", render_char_pretty(b)));
        }
        let missing = 4usize.saturating_sub(std::cmp::min(4, len - start));
        for _ in 0..missing {
            s.push_str("    ");
        }
        s.push('\n');
    }
    s
}

fn render_char_pretty(b: u8) -> String {
    match b {
        0x00 => "\\0".to_string(),
        0x08 => "\\b".to_string(),
        0x09 => "\\t".to_string(),
        0x0A => "\\n".to_string(),
        0x0C => "\\f".to_string(),
        0x20..=0x7E => (b as char).to_string(),
        _ => format!("\\x{:02X}", b),
    }
}

fn read_string(core: &Core, mut addr: u32) -> String {
    let assembler_base = 0x10010000;
    let memory_base = 0x04004000;
    addr = addr - assembler_base + memory_base;
    let mut out = String::new();
    loop {
        match core.read_memory(addr) {
            Ok(word) => {
                let byte = (word & 0xFF) as u8;
                if byte == 0 { break; }
                out.push(byte as char);
                addr += 1;
            }
            Err(_) => break,
        }
    }
    out
}
