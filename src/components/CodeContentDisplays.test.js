
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { TextSegmentDisplay, DataSegmentDisplay, toHexString, textToAscii, decodeInstruction, signExtend, regName } from './CodeContentDisplays';

// Test the utility function "toHexString"
test('toHexString should convert numbers to an 8-digit hex string', () => {
    expect(toHexString(0)).toBe('00000000');
    expect(toHexString(123)).toBe('0000007b'); // 123 in hex is 7b
    expect(toHexString(0xffffffff)).toBe('ffffffff');
});

// Test the TextSegmentDisplay component
test('TextSegmentDisplay renders a table with correct addresses and code values', () => {
    const sampleTextDump = "deadbeef\ncafebabe\n";
    render(<TextSegmentDisplay textDump={sampleTextDump} />);

    const table = screen.getByRole('table');
    const rowgroups = within(table).getAllByRole('rowgroup');
    const headerRows = within(rowgroups[0]).getAllByRole('row');
    const bodyRows = within(rowgroups[1]).getAllByRole('row');

    // Validate row counts: 1 header row and 2 body rows (for 2 code lines)
    expect(headerRows.length).toBe(1);
    expect(bodyRows.length).toBe(2);

    // Check that the addresses are computed correctly.
    // The base address is 4194304 (0x00400000), and each subsequent row increments by 4.
    expect(screen.getByText('0x00400000')).toBeInTheDocument();
    expect(screen.getByText('0x00400004')).toBeInTheDocument();

    // Verify the code values are rendered with a "0x" prefix.
    expect(screen.getByText('0xdeadbeef')).toBeInTheDocument();
    expect(screen.getByText('0xcafebabe')).toBeInTheDocument();
});

// Test the DataSegmentDisplay component
test('DataSegmentDisplay renders a table with 15 rows and fills missing cells with default values', () => {
    const sampleDataDump = "11111111\n22222222\n33333333\n44444444\n55555555\n";
    render(<DataSegmentDisplay dataDump={sampleDataDump} />);

    const table = screen.getByRole('table');
    const rowgroups = within(table).getAllByRole('rowgroup');
    const bodyRows = within(rowgroups[1]).getAllByRole('row');

    // Verify there are exactly 15 rows in the tbody.
    expect(bodyRows.length).toBe(15);

    // Verify that each row contains 10 cells (1 address cell + 9 data cells).
    bodyRows.forEach(row => {
        const cells = within(row).getAllByRole('cell');
        expect(cells.length).toBe(10);
    });

    // Validate the first row's address.
    // The base address for DataSegmentDisplay is 268500992, which converts to 0x10010000.
    expect(screen.getByText('0x10010000')).toBeInTheDocument();

    // Verify that the provided data values are rendered.
    expect(screen.getByText('0x11111111')).toBeInTheDocument();
    expect(screen.getByText('0x22222222')).toBeInTheDocument();
    expect(screen.getByText('0x33333333')).toBeInTheDocument();
    expect(screen.getByText('0x44444444')).toBeInTheDocument();
    expect(screen.getByText('0x55555555')).toBeInTheDocument();

    const defaultCells = screen.getAllByText('0x00000000');
    expect(defaultCells.length).toBeGreaterThan(0);
});

// 1. Test textToAscii with a valid hex string (8 characters)
test('textToAscii returns correct ascii for valid hex string', () => {
    expect(textToAscii("41424344")).toBe("ABCD");
});

// 2. Test textToAscii with hex string of incorrect length
test('textToAscii returns empty string for hex string of incorrect length', () => {
    expect(textToAscii("1234567")).toBe('');
});

// 3. Test textToAscii with null input
test('textToAscii returns empty string for null input', () => {
    expect(textToAscii(null)).toBe('');
});

// 4. Test decodeInstruction for R-type "add" instruction
test('decodeInstruction decodes R-type add instruction', () => {
    const word = (3 << 21) | (4 << 16) | (2 << 11) | (0 << 6) | 0x20;
    const hex = toHexString(word);
    expect(decodeInstruction(hex)).toBe("add $v0, $v1, $a0");
});

// 6. Test decodeInstruction for I-type addi instruction
test('decodeInstruction decodes I-type addi instruction', () => {
    const word = (0x08 << 26) | (4 << 21) | (5 << 16) | 0x10;
    const hex = toHexString(word);
    expect(decodeInstruction(hex)).toBe("addi $a1, $a0, 16");
});

// 7. Test decodeInstruction for I-type andi instruction
test('decodeInstruction decodes I-type andi instruction', () => {
    const word = (0x0c << 26) | (6 << 21) | (7 << 16) | 0x00ff;
    const hex = toHexString(word);
    expect(decodeInstruction(hex)).toBe("andi $a3, $a2, 0xff");
});

// 8. Test decodeInstruction for I-type lui instruction
test('decodeInstruction decodes I-type lui instruction', () => {
    const word = (0x0f << 26) | (8 << 16) | 0x1234;
    const hex = toHexString(word);
    expect(decodeInstruction(hex)).toBe("lui $t0, 0x1234");
});

// 9. Test decodeInstruction for I-type beq instruction with a negative immediate
test('decodeInstruction decodes I-type beq instruction with negative immediate', () => {
    const word = (0x04 << 26) | (9 << 21) | (10 << 16) | 0xffff;
    const hex = toHexString(word);
    expect(decodeInstruction(hex)).toBe("beq $t1, $t2, offset -1");
});

// 10. Test decodeInstruction for I-type bne instruction
test('decodeInstruction decodes I-type bne instruction', () => {
    const word = (0x05 << 26) | (11 << 21) | (12 << 16) | 5;
    const hex = toHexString(word);
    expect(decodeInstruction(hex)).toBe("bne $t3, $t4, offset 5");
});

// 11. Test decodeInstruction for REGIMM "bltz" instruction (rt=0)
test('decodeInstruction decodes REGIMM bltz instruction', () => {
    const word = (0x01 << 26) | (13 << 21) | (0 << 16) | 10;
    const hex = toHexString(word);
    expect(decodeInstruction(hex)).toBe("bltz $t5, offset 10");
});

// 12. Test decodeInstruction for REGIMM with an unknown rt (not 0 or 1)
test('decodeInstruction decodes REGIMM with unknown rt', () => {
    const word = (0x01 << 26) | (13 << 21) | (2 << 16);
    const hex = toHexString(word);
    expect(decodeInstruction(hex)).toBe("REGIMM 2");
});

// 13. Test decodeInstruction for I-type lw (load word) instruction
test('decodeInstruction decodes I-type lw instruction', () => {
    const word = (0x23 << 26) | (14 << 21) | (15 << 16) | 0x20;
    const hex = toHexString(word);
    expect(decodeInstruction(hex)).toBe("lw $t7, 32($t6)");
});

// 14. Test decodeInstruction for J-type j instruction
test('decodeInstruction decodes J-type j instruction', () => {
    const word = (0x02 << 26) | 0x12345;
    const hex = toHexString(word);
    expect(decodeInstruction(hex)).toBe("j 0x00048d14");
});

// 15. Test decodeInstruction for J-type jal instruction
test('decodeInstruction decodes J-type jal instruction', () => {
    const word = (0x03 << 26) | 0x23456;
    const hex = toHexString(word);
    expect(decodeInstruction(hex)).toBe("jal 0x0008d158");
});

// 16. Test signExtend for a positive number (no sign change)
test('signExtend returns same value for positive numbers', () => {
    expect(signExtend(0x1234)).toBe(0x1234);
});

// 17. Test signExtend for a negative number
test('signExtend correctly extends negative values', () => {
    expect(signExtend(0xffff)).toBe(-1);
});

// 18. Test regName returns proper names and falls back for out-of-range indices
test('regName returns correct register names and fallback for out-of-range', () => {
    expect(regName(0)).toBe("zero");
    expect(regName(31)).toBe("ra");
    expect(regName(32)).toBe("r32");
});

// 19. Test decodeInstruction for I-type lb instruction with negative immediate
test('decodeInstruction decodes I-type lb instruction with negative immediate', () => {
    const word = (0x20 << 26) | (2 << 21) | (3 << 16) | 0xfffe;
    const hex = toHexString(word);
    expect(decodeInstruction(hex)).toBe("lb $v1, -2($v0)");
});

// 20. Test decodeInstruction with an invalid hex input (incorrect length)
test('decodeInstruction returns empty string for invalid input length', () => {
    expect(decodeInstruction("1234")).toBe('');
});

// 21. Test textToAscii returns dots for non-printable characters.
test('textToAscii returns dots for non-printable characters', () => {
    // For the hex "00010203", none of the resulting bytes are printable.
    expect(textToAscii("00010203")).toBe("....");
});

// 22. Test decodeInstruction returns "Unknown opcode" for an unhandled opcode.
test('decodeInstruction returns unknown opcode for unhandled opcode', () => {
    const word = (0x3F << 26);
    const hex = toHexString(word);
    expect(decodeInstruction(hex)).toBe("Unknown opcode 0x3f");
});

// 23. Test TextSegmentDisplay displays decoded instruction when showAscii is true.
test('TextSegmentDisplay displays decoded instruction when showAscii is true', () => {
    // "00000020" decodes (as an R-type add with all registers zero) to "add $zero, $zero, $zero".
    const sampleTextDump = "00000020\n";
    render(<TextSegmentDisplay textDump={sampleTextDump} showAscii={true} />);
    expect(screen.getByText("add $zero, $zero, $zero")).toBeInTheDocument();
});

// 24. Test DataSegmentDisplay displays ascii text when showAscii is true.
test('DataSegmentDisplay displays ascii text when showAscii is true', () => {
    // "41424344" decodes to "ABCD"
    const sampleDataDump = "41424344\n";
    render(<DataSegmentDisplay dataDump={sampleDataDump} showAscii={true} />);
    expect(screen.getByText("ABCD")).toBeInTheDocument();
});

// 25. Test that the currentLine row is highlighted in TextSegmentDisplay.
test('TextSegmentDisplay highlights currentLine with yellow background', () => {
    const sampleTextDump = "deadbeef\ncafebabe\n";
    render(<TextSegmentDisplay textDump={sampleTextDump} currentLine={1} />);
    const table = screen.getByRole('table');
    const tbody = within(table).getAllByRole('rowgroup')[1];
    const rows = within(tbody).getAllByRole('row');
    // The row at index 1 in tbody should have a background color of "#ffcc00"
    expect(rows[1]).toHaveStyle('background-color: #ffcc00');
});

// 26. Test decodeInstruction decodes an R-type sll instruction.
test('decodeInstruction decodes R-type sll instruction', () => {
    const word = (0 << 26) | (0 << 21) | (3 << 16) | (4 << 11) | (2 << 6) | 0x00;
    const hex = toHexString(word);
    expect(decodeInstruction(hex)).toBe("sll $a0, $v1, 2");
});

// 27. Test decodeInstruction decodes an R-type srl instruction.
test('decodeInstruction decodes R-type srl instruction', () => {
    const word = (0 << 26) | (0 << 21) | (5 << 16) | (6 << 11) | (3 << 6) | 0x02;
    const hex = toHexString(word);
    expect(decodeInstruction(hex)).toBe("srl $a2, $a1, 3");
});

// 28. Test decodeInstruction returns an empty string for null input.
test('decodeInstruction returns empty string for null input', () => {
    expect(decodeInstruction(null)).toBe('');
});

// 29. Test toHexString correctly converts negative numbers to their unsigned hex representation.
test('toHexString correctly converts negative numbers to unsigned hex', () => {
    // In JavaScript, -123 >>> 0 equals 0xffffff85.
    expect(toHexString(-123)).toBe('ffffff85');
});