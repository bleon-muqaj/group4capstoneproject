export const instructionDetails = {
    add: {//not implemented in mimic
        usage: 'add $d, $s, $t',
        description: 'Adds registers $s and $t and stores the result in $d.',
        pdfPage: 43,
    },
    addu: {
        usage: 'addu $d, $s, $t',
        description: 'Adds registers $s and $t without checking for overflow.',
        pdfPage: 48,
    },
    sub: {//not implemented in mimic
        usage: 'sub $d, $s, $t',
        description: 'Subtracts register $t from register $s and stores the result in $d.',
        pdfPage: 398,
    },
    subu: {//not implemented in mimic
        usage: 'subu $d, $s, $t',
        description: 'Subtracts registers $s and $t without checking for overflow.',
        pdfPage: 400,
    },
    and: {//not implemented in mimic
        usage: 'and $d, $s, $t',
        description: 'Performs a bitwise AND on registers $s and $t, storing the result in $d.',
        pdfPage: 54,
    },
    or: {
        usage: 'or $d, $s, $t',
        description: 'Performs a bitwise OR on registers $s and $t, storing the result in $d.',
        pdfPage: 324,
    },
    xor: {
        usage: 'xor $d, $s, $t',
        description: 'Performs a bitwise XOR on registers $s and $t, storing the result in $d.',
        pdfPage: 456,
    },
    nor: {//not implemented in mimic
        usage: 'nor $d, $s, $t',
        description: 'Performs a bitwise NOR on registers $s and $t, storing the result in $d.',
        pdfPage: 323,
    },
    slt: {
        usage: 'slt $d, $s, $t',
        description: 'Sets register $d to 1 if register $s is less than register $t; otherwise, sets it to 0.',
        pdfPage: 388,
    },
    sltu: {//not implemented in mimic
        usage: 'sltu $d, $s, $t',
        description: 'Sets register $d to 1 if register $s is less than register $t (unsigned), otherwise 0.',
        pdfPage: 391,
    },
    addi: {
        usage: 'addi $t, $s, imm',
        description: 'Adds the immediate value imm to register $s and stores the result in $t.',
        pdfPage: 45,
    },
    addiu: {
        usage: 'addiu $t, $s, imm',
        description: 'Adds the immediate value imm to register $s and stores the result in $t without overflow checking.',
        pdfPage: 46,
    },
    andi: {
        usage: 'andi $t, $s, imm',
        description: 'Performs a bitwise AND between register $s and the immediate value imm, storing the result in $t.',
        pdfPage: 55,
    },
    ori: {
        usage: 'ori $t, $s, imm',
        description: 'Performs a bitwise OR between register $s and the immediate value imm, storing the result in $t.',
        pdfPage: 325,
    },
    xori: {//not implemented in mimic
        usage: 'xori $t, $s, imm',
        description: 'Performs a bitwise XOR between register $s and the immediate value imm, storing the result in $t.',
        pdfPage: 457,
    },
    lui: {
        usage: 'lui $t, imm',
        description: 'Loads the immediate value imm into the upper 16 bits of register $t.',
        pdfPage: 243,
    },
    sll: {
        usage: 'sll $d, $t, shamt',
        description: 'Shifts register $t left by shamt bits and stores the result in $d.',
        pdfPage: 386,
    },
    srl: {//not implemented in mimic
        usage: 'srl $d, $t, shamt',
        description: 'Shifts register $t right logically by shamt bits and stores the result in $d.',
        pdfPage: 395,
    },
    sra: {//not implemented in mimic
        usage: 'sra $d, $t, shamt',
        description: 'Shifts register $t right arithmetically by shamt bits and stores the result in $d.',
        pdfPage: 393,
    },
    sllv: {//not implemented in mimic
        usage: 'sllv $d, $t, $s',
        description: 'Shifts register $t left by the number of bits specified in register $s and stores the result in $d.',
        pdfPage: 387,
    },
    srlv: {//not implemented in mimic
        usage: 'srlv $d, $t, $s',
        description: 'Shifts register $t right logically by the number of bits specified in register $s and stores the result in $d.',
        pdfPage: 396,
    },
    srav: {//not implemented in mimic
        usage: 'srav $d, $t, $s',
        description: 'Shifts register $t right arithmetically by the number of bits specified in register $s and stores the result in $d.',
        pdfPage: 394,
    },
    beq: {
        usage: 'beq $s, $t, offset',
        description: 'Branches to the given offset if registers $s and $t are equal.',
        pdfPage: 82,
    },
    bne: {
        usage: 'bne $s, $t, offset',
        description: 'Branches to the given offset if registers $s and $t are not equal.',
        pdfPage: 113,
    },
    blez: {//not implemented in mimic
        usage: 'blez $s, offset',
        description: 'Branches to the given offset if register $s is less than or equal to zero.',
        pdfPage: 104,
    },
    bgtz: {//not implemented in mimic
        usage: 'bgtz $s, offset',
        description: 'Branches to the given offset if register $s is greater than zero.',
        pdfPage: 98,
    },
    bltz: {//not implemented in mimic
        usage: 'bltz $s, offset',
        description: 'Branches to the given offset if register $s is less than zero.',
        pdfPage: 107,
    },
    bgez: {//not implemented in mimic
        usage: 'bgez $s, offset',
        description: 'Branches to the given offset if register $s is greater than or equal to zero.',
        pdfPage: 85,
    },
    j: {
        usage: 'j target',
        description: 'Jumps to the specified target address.',
        pdfPage: 204,
    },
    jal: {//not implemented in mimic
        usage: 'jal target',
        description: 'Jumps to the specified target address and stores the return address in $ra.',
        pdfPage: 205,
    },
    jr: {//not implemented in mimic
        usage: 'jr $s',
        description: 'Jumps to the address contained in register $s.',
        pdfPage: 216,
    },
    jalr: {///not implemented in mimic
        usage: 'jalr $d, $s',
        description: 'Jumps to the address in register $s and stores the return address in register $d (typically $ra).',
        pdfPage: 206,
    },
    lb: {//not implemented in mimic
        usage: 'lb $t, offset($s)',
        description: 'Loads a byte from memory at the address computed by ($s + offset) into register $t.',
        pdfPage: 221,
    },
    lh: {//not implemented in mimic
        usage: 'lh $t, offset($s)',
        description: 'Loads a half-word from memory at the address computed by ($s + offset) into register $t.',
        pdfPage: 229,
    },
    lw: {//not implemented in mimic
        usage: 'lw $t, offset($s)',
        description: 'Loads a word from memory at the address computed by ($s + offset) into register $t.',
        pdfPage: 245,
    },
    lbu: {//not implemented in mimic
        usage: 'lbu $t, offset($s)',
        description: 'Loads an unsigned byte from memory at the address computed by ($s + offset) into register $t.',
        pdfPage: 223,
    },
    lhu: {//not implemented in mimic
        usage: 'lhu $t, offset($s)',
        description: 'Loads an unsigned half-word from memory at the address computed by ($s + offset) into register $t.',
        pdfPage: 231,
    },
    sb: {//not implemented in mimic
        usage: 'sb $t, offset($s)',
        description: 'Stores the least significant byte of register $t into memory at the address computed by ($s + offset).',
        pdfPage: 354,
    },
    sh: {//not implemented in mimic
        usage: 'sh $t, offset($s)',
        description: 'Stores a half-word from register $t into memory at the address computed by ($s + offset).',
        pdfPage: 383,
    },
    sw: {//not implemented in mimic
        usage: 'sw $t, offset($s)',
        description: 'Stores a word from register $t into memory at the address computed by ($s + offset).',
        pdfPage: 402,
    },
    syscall: {
        usage: 'System Call',
        description: 'Triggers a system call exception (exception code 8) that causes control to be transferred from user space to kernel space where the system call is handle',
        pdfPage: 425,
    },
    li: {
        usage: 'li $t, imm',
        description: 'Loads an immediate up to 32 bits in size in to register $t (Considered a pseudo-instruction, provided by assembler and not the processor)',
        pdfPage: 'N/A',
    },
    la: {
        usage: 'la $t, label',
        description: 'Loads computed address of label into register $t (Considered a pseudo-instruction, provided by assembler and not the processor)',
        pdfPage: 'N/A',
    },
    move: {
        usage: 'move $t,$s',
        description: 'Copy register $t to register $s (Considered a pseudo-instruction, provided by assembler and not the processor)',
        pdfPage: 'N/A',
    }
};