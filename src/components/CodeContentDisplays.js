import React from 'react';

 export function toHexString(number) {
    const hexString = (number >>> 0).toString(16);
    return hexString.padStart(8, '0');
}
export function textToAscii(hexString) {
    if (!hexString || hexString.length !== 8) return '';
    let ascii = '';
    for (let i = 0; i < 8; i += 2) {
        const byte = hexString.slice(i, i + 2);
        const char = String.fromCharCode(parseInt(byte, 16));
        ascii += (char >= ' ' && char <= '~') ? char : '.';
    }
    return ascii;
}
export function decodeInstruction(hex) {
    if (!hex || hex.length !== 8) return '';
    const word = parseInt(hex, 16);
    const opcode = (word >>> 26) & 0x3f;

    const rs = (word >>> 21) & 0x1f;
    const rt = (word >>> 16) & 0x1f;
    const rd = (word >>> 11) & 0x1f;
    const shamt = (word >>> 6) & 0x1f;
    const funct = word & 0x3f;
    const imm = word & 0xffff;
    const addr = word & 0x3ffffff;

    // R-Type
    if (opcode === 0x00) {
        switch (funct) {
            case 0x20: return `add $${regName(rd)}, $${regName(rs)}, $${regName(rt)}`;
            case 0x21: return `addu $${regName(rd)}, $${regName(rs)}, $${regName(rt)}`;
            case 0x22: return `sub $${regName(rd)}, $${regName(rs)}, $${regName(rt)}`;
            case 0x23: return `subu $${regName(rd)}, $${regName(rs)}, $${regName(rt)}`;
            case 0x24: return `and $${regName(rd)}, $${regName(rs)}, $${regName(rt)}`;
            case 0x25: return `or $${regName(rd)}, $${regName(rs)}, $${regName(rt)}`;
            case 0x26: return `xor $${regName(rd)}, $${regName(rs)}, $${regName(rt)}`;
            case 0x27: return `nor $${regName(rd)}, $${regName(rs)}, $${regName(rt)}`;
            case 0x2a: return `slt $${regName(rd)}, $${regName(rs)}, $${regName(rt)}`;
            case 0x2b: return `sltu $${regName(rd)}, $${regName(rs)}, $${regName(rt)}`;
            case 0x00: return `sll $${regName(rd)}, $${regName(rt)}, ${shamt}`;
            case 0x02: return `srl $${regName(rd)}, $${regName(rt)}, ${shamt}`;
            case 0x03: return `sra $${regName(rd)}, $${regName(rt)}, ${shamt}`;
            case 0x04: return `sllv $${regName(rd)}, $${regName(rt)}, $${regName(rs)}`;
            case 0x06: return `srlv $${regName(rd)}, $${regName(rt)}, $${regName(rs)}`;
            case 0x07: return `srav $${regName(rd)}, $${regName(rt)}, $${regName(rs)}`;
            case 0x08: return `jr $${regName(rs)}`;
            case 0x09: return `jalr $${regName(rd)}, $${regName(rs)}`;
            case 0x0c: return 'syscall';
            default: return `R-type funct 0x${funct.toString(16)}`;
        }
    }

    // I-Type
    switch (opcode) {
        case 0x08: return `addi $${regName(rt)}, $${regName(rs)}, ${signExtend(imm)}`;
        case 0x09: return `addiu $${regName(rt)}, $${regName(rs)}, ${signExtend(imm)}`;
        case 0x0c: return `andi $${regName(rt)}, $${regName(rs)}, 0x${imm.toString(16)}`;
        case 0x0d: return `ori $${regName(rt)}, $${regName(rs)}, 0x${imm.toString(16)}`;
        case 0x0e: return `xori $${regName(rt)}, $${regName(rs)}, 0x${imm.toString(16)}`;
        case 0x0f: return `lui $${regName(rt)}, 0x${imm.toString(16)}`;
        case 0x04: return `beq $${regName(rs)}, $${regName(rt)}, offset ${signExtend(imm)}`;
        case 0x05: return `bne $${regName(rs)}, $${regName(rt)}, offset ${signExtend(imm)}`;
        case 0x06: return `blez $${regName(rs)}, offset ${signExtend(imm)}`;
        case 0x07: return `bgtz $${regName(rs)}, offset ${signExtend(imm)}`;
        case 0x01:
            switch (rt) {
                case 0x00: return `bltz $${regName(rs)}, offset ${signExtend(imm)}`;
                case 0x01: return `bgez $${regName(rs)}, offset ${signExtend(imm)}`;
                default: return `REGIMM ${rt}`;
            }
        case 0x20: return `lb $${regName(rt)}, ${signExtend(imm)}($${regName(rs)})`;
        case 0x21: return `lh $${regName(rt)}, ${signExtend(imm)}($${regName(rs)})`;
        case 0x23: return `lw $${regName(rt)}, ${signExtend(imm)}($${regName(rs)})`;
        case 0x24: return `lbu $${regName(rt)}, ${signExtend(imm)}($${regName(rs)})`;
        case 0x25: return `lhu $${regName(rt)}, ${signExtend(imm)}($${regName(rs)})`;
        case 0x28: return `sb $${regName(rt)}, ${signExtend(imm)}($${regName(rs)})`;
        case 0x29: return `sh $${regName(rt)}, ${signExtend(imm)}($${regName(rs)})`;
        case 0x2b: return `sw $${regName(rt)}, ${signExtend(imm)}($${regName(rs)})`;
    }

    // J-Type
    if (opcode === 0x02) return `j 0x${(addr << 2).toString(16).padStart(8, '0')}`;
    if (opcode === 0x03) return `jal 0x${(addr << 2).toString(16).padStart(8, '0')}`;

    return `Unknown opcode 0x${opcode.toString(16)}`;
}

export function regName(index) {
    const names = [
        'zero', 'at', 'v0', 'v1', 'a0', 'a1', 'a2', 'a3',
        't0', 't1', 't2', 't3', 't4', 't5', 't6', 't7',
        's0', 's1', 's2', 's3', 's4', 's5', 's6', 's7',
        't8', 't9', 'k0', 'k1', 'gp', 'sp', 'fp', 'ra'
    ];
    return names[index] || `r${index}`;
}

export function signExtend(n) {
    return n & 0x8000 ? n - 0x10000 : n;
}

export function TextSegmentDisplay({ textDump, breakpoints = new Set(), toggleBreakpoint = () => {}, currentLine = null, showAscii = false }) {
    const textValues = textDump.slice(0, -1).split('\n');
    const baseAddress = 4194304;

    return (
        <div style={{ overflowX: 'hidden', width: '100%' }}>
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                border: '2px solid grey',
                tableLayout: 'fixed'
            }}>
                <thead>
                <tr>
                    <th style={{ width: '10%', border: '1px solid grey', padding: '5px' }}>Break</th>
                    <th style={{ width: '30%', border: '1px solid grey', padding: '5px' }}>Address</th>
                    <th style={{ width: '15%', border: '1px solid grey', padding: '5px' }}>Code</th>
                </tr>
                </thead>
                <tbody>
                {textValues.map((value, index) => {
                    const isBreakpoint = breakpoints.has(index);
                    const isCurrent = currentLine === index;

                    return (
                        <tr key={index} style={{ backgroundColor: isCurrent ? '#ffcc00' : 'transparent' }}>
                            <td style={{ textAlign: 'center', border: '1px solid grey' }}>
                                <input
                                    type="checkbox"
                                    checked={isBreakpoint}
                                    onChange={() => toggleBreakpoint(index)}
                                />
                            </td>
                            <td style={{
                                border: '1px solid grey',
                                padding: '5px',
                                textAlign: 'center',
                                fontWeight: 'bold'
                            }}>
                                0x{(baseAddress + index * 4).toString(16).padStart(8, '0')}
                            </td>
                            <td style={{ border: '1px solid grey', padding: '5px', textAlign: 'center' }}>
                                {showAscii
                                    ? decodeInstruction(value)
                                    : `0x${value}`}
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
}

export function DataSegmentDisplay({ dataDump, showAscii = false }) {
    const initialDataValues = dataDump.slice(0, -1).split('\n');
    const filledDataValues = [...initialDataValues, ...Array(15 * 9 - initialDataValues.length).fill('00000000')];
    const tableValues = Array.from({length: 15}, (_, rowIndex) =>
        filledDataValues.slice(rowIndex * 9, (rowIndex + 1) * 9)
    );
    const baseAddress = 268500992;

    return (
        <div style={{overflowX: 'hidden', width: '100%'}}>
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                border: '2px solid grey',
                tableLayout: 'fixed'
            }}>
                <thead>
                <tr>
                    <th style={{width: '15%', border: '1px solid grey', padding: '5px'}}>Address</th>
                    <th style={{width: '15%', border: '1px solid grey', padding: '5px'}}>Value (+0)</th>
                    <th style={{width: '15%', border: '1px solid grey', padding: '5px'}}>Value (+4)</th>
                    <th style={{width: '15%', border: '1px solid grey', padding: '5px'}}>Value (+8)</th>
                    <th style={{width: '15%', border: '1px solid grey', padding: '5px'}}>Value (+c)</th>
                    <th style={{width: '15%', border: '1px solid grey', padding: '5px'}}>Value (+10)</th>
                    <th style={{width: '15%', border: '1px solid grey', padding: '5px'}}>Value (+14)</th>
                    <th style={{width: '15%', border: '1px solid grey', padding: '5px'}}>Value (+18)</th>
                    <th style={{width: '15%', border: '1px solid grey', padding: '5px'}}>Value (+1c)</th>
                </tr>
                </thead>
                <tbody>
                {tableValues.map((row, rowIndex) => (
                    <tr key={rowIndex} style={{backgroundColor: 'transparent'}}>
                        <td style={{
                            border: '1px solid grey',
                            padding: '5px',
                            textAlign: 'center',
                            fontWeight: 'bold'
                        }}>
                            0x{toHexString(baseAddress + rowIndex * 32)}
                        </td>
                        {row.map((value, colIndex) => (
                            <td key={colIndex} style={{
                                border: '1px solid grey',
                                padding: '5px',
                                textAlign: 'center'
                            }}>
                                {showAscii
                                    ? textToAscii(value)
                                    : `0x${value}`}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
