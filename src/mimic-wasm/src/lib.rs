use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;


#[wasm_bindgen(start)]
fn start() {
    std::panic::set_hook(Box::new(console_error_panic_hook::hook));
}

#[wasm_bindgen]
extern {
    pub fn alert(s: &str);
}

#[wasm_bindgen]
pub struct AssemblerResult {
    failed: bool,
    error: String,
    text: Vec<u8>,
    data: Vec<u8>,
}

#[wasm_bindgen]
impl AssemblerResult {

    pub fn failed(&self) -> bool {
        self.failed
    }

    pub fn error(&self) -> String {
        self.error.clone()
    }

    pub fn text(&self) -> Vec<u8> {
        self.text.clone()
    }

    pub fn data(&self) -> Vec<u8> {
        self.data.clone()
    }

}

#[wasm_bindgen]
pub fn assemble_mips32(source: &str) -> AssemblerResult {
    match mimic::mips32::assembler::assemble_from_string(source.to_owned()) {
        Ok((text, data)) => AssemblerResult {
            failed: false,
            error: String::new(),
            text,
            data
        },

        Err(err) => AssemblerResult {
            failed: true,
            error: err.msg(),
            text: vec![],
            data: vec![],
        },
    }    
}


#[wasm_bindgen]
pub struct Mips32Core {
    core: mimic::mips32::core::Core,
}

#[wasm_bindgen]
impl Mips32Core {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            core: mimic::mips32::core::Core::new_mips_default(),
        }
    }

    pub fn load_text(&mut self, text: Vec<u8>) {
        self.core.load_text(bytes_to_words(text));
    }

    pub fn load_data(&mut self, data: Vec<u8>) {
        self.core.load_data(bytes_to_words(data));
    }

    pub fn dump_registers(&self) -> Vec<u32> {
        self.core.dump_registers().to_vec()
    }

    /// Returns true if any data between $sp and the stack top changes
    pub fn stack_changed(&self) -> bool {
        false
    }

    pub fn dump_stack(&self) -> Vec<u8> {
        vec![]
    }

    /// Returns true if any data between the data section and $sp has changed
    pub fn heap_changed(&self) -> bool {
        false
    }

    pub fn dump_heap(&self) -> Vec<u8> {
        vec![]
    }

    /// Returns true if any data in the static data section has changed
    pub fn static_changed(&self) -> bool {
        false
    }

    pub fn dump_static(&self) -> Vec<u8> {
        vec![]
    }

    // pub fn tick(&mut self, f: js_sys::Function) {
    //     self.core.tick(|code: u32, regs: [u32; 32]| {
    //         let this = JsValue::NULL;
    //         let code = JsValue::from(code);
    //         let regs_array = js_sys::Int32Array::from(
    //             regs.iter()
    //                 .map(|n| *n as i32)
    //                 .collect::<Vec<i32>>()
    //                 .as_slice()
    //         );
    //
    //         let new_regs_array: js_sys::Int32Array = f.call2(&this, &code, &regs_array).unwrap().into();
    //
    //         let mut new_regs: [u32; 32] = [0; 32];
    //         let new_regs_array = new_regs_array.to_vec();
    //         for i in 0..32 {
    //             new_regs[i] = *new_regs_array.get(i).unwrap_or(&0) as u32;
    //         }
    //
    //         new_regs
    //             
    //     }).unwrap();

    pub fn tick(&mut self) -> bool {
        self.core.tick()
    }
}

#[wasm_bindgen]
pub fn bytes_to_words(bytes: Vec<u8>) -> Vec<u32> {
    let mut words: Vec<u32> = Vec::new();

    for i in 0..(bytes.len() / 4) {
        let mut inst: u32 = 0;
        inst |= (*bytes.get(i * 4 + 0).unwrap_or(&0) as u32) << 0;
        inst |= (*bytes.get(i * 4 + 1).unwrap_or(&0) as u32) << 8;
        inst |= (*bytes.get(i * 4 + 2).unwrap_or(&0) as u32) << 16;
        inst |= (*bytes.get(i * 4 + 3).unwrap_or(&0) as u32) << 24;

        words.push(inst);
   }

    words
}
