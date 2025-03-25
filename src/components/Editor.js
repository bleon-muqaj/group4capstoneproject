import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';

const instructionDetails = {
    add: {
        usage: 'add $d, $s, $t',
        description: 'Adds registers $s and $t and stores the result in $d.',
        pdfPage: 10,
    },
    addu: {
        usage: 'addu $d, $s, $t',
        description: 'Adds registers $s and $t without checking for overflow.',
        pdfPage: 0,
    },
    sub: {
        usage: 'sub $d, $s, $t',
        description: 'Subtracts register $t from register $s and stores the result in $d.',
        pdfPage: 0,
    },
    subu: {
        usage: 'subu $d, $s, $t',
        description: 'Subtracts registers $s and $t without checking for overflow.',
        pdfPage: 0,
    },
    and: {
        usage: 'and $d, $s, $t',
        description: 'Performs a bitwise AND on registers $s and $t, storing the result in $d.',
        pdfPage: 0,
    },
    or: {
        usage: 'or $d, $s, $t',
        description: 'Performs a bitwise OR on registers $s and $t, storing the result in $d.',
        pdfPage: 0,
    },
    xor: {
        usage: 'xor $d, $s, $t',
        description: 'Performs a bitwise XOR on registers $s and $t, storing the result in $d.',
        pdfPage: 0,
    },
    nor: {
        usage: 'nor $d, $s, $t',
        description: 'Performs a bitwise NOR on registers $s and $t, storing the result in $d.',
        pdfPage: 0,
    },
    slt: {
        usage: 'slt $d, $s, $t',
        description: 'Sets register $d to 1 if register $s is less than register $t; otherwise, sets it to 0.',
        pdfPage: 0,
    },
    sltu: {
        usage: 'sltu $d, $s, $t',
        description: 'Sets register $d to 1 if register $s is less than register $t (unsigned), otherwise 0.',
        pdfPage: 0,
    },
    addi: {
        usage: 'addi $t, $s, imm',
        description: 'Adds the immediate value imm to register $s and stores the result in $t.',
        pdfPage: 0,
    },
    addiu: {
        usage: 'addiu $t, $s, imm',
        description: 'Adds the immediate value imm to register $s and stores the result in $t without overflow checking.',
        pdfPage: 0,
    },
    andi: {
        usage: 'andi $t, $s, imm',
        description: 'Performs a bitwise AND between register $s and the immediate value imm, storing the result in $t.',
        pdfPage: 0,
    },
    ori: {
        usage: 'ori $t, $s, imm',
        description: 'Performs a bitwise OR between register $s and the immediate value imm, storing the result in $t.',
        pdfPage: 0,
    },
    xori: {
        usage: 'xori $t, $s, imm',
        description: 'Performs a bitwise XOR between register $s and the immediate value imm, storing the result in $t.',
        pdfPage: 0,
    },
    lui: {
        usage: 'lui $t, imm',
        description: 'Loads the immediate value imm into the upper 16 bits of register $t.',
        pdfPage: 0,
    },
    sll: {
        usage: 'sll $d, $t, shamt',
        description: 'Shifts register $t left by shamt bits and stores the result in $d.',
        pdfPage: 0,
    },
    srl: {
        usage: 'srl $d, $t, shamt',
        description: 'Shifts register $t right logically by shamt bits and stores the result in $d.',
        pdfPage: 0,
    },
    sra: {
        usage: 'sra $d, $t, shamt',
        description: 'Shifts register $t right arithmetically by shamt bits and stores the result in $d.',
        pdfPage: 0,
    },
    sllv: {
        usage: 'sllv $d, $t, $s',
        description: 'Shifts register $t left by the number of bits specified in register $s and stores the result in $d.',
        pdfPage: 0,
    },
    srlv: {
        usage: 'srlv $d, $t, $s',
        description: 'Shifts register $t right logically by the number of bits specified in register $s and stores the result in $d.',
        pdfPage: 0,
    },
    srav: {
        usage: 'srav $d, $t, $s',
        description: 'Shifts register $t right arithmetically by the number of bits specified in register $s and stores the result in $d.',
        pdfPage: 0,
    },
    beq: {
        usage: 'beq $s, $t, offset',
        description: 'Branches to the given offset if registers $s and $t are equal.',
        pdfPage: 0,
    },
    bne: {
        usage: 'bne $s, $t, offset',
        description: 'Branches to the given offset if registers $s and $t are not equal.',
        pdfPage: 0,
    },
    blez: {
        usage: 'blez $s, offset',
        description: 'Branches to the given offset if register $s is less than or equal to zero.',
        pdfPage: 0,
    },
    bgtz: {
        usage: 'bgtz $s, offset',
        description: 'Branches to the given offset if register $s is greater than zero.',
        pdfPage: 0,
    },
    bltz: {
        usage: 'bltz $s, offset',
        description: 'Branches to the given offset if register $s is less than zero.',
        pdfPage: 0,
    },
    bgez: {
        usage: 'bgez $s, offset',
        description: 'Branches to the given offset if register $s is greater than or equal to zero.',
        pdfPage: 0,
    },
    j: {
        usage: 'j target',
        description: 'Jumps to the specified target address.',
        pdfPage: 0,
    },
    jal: {
        usage: 'jal target',
        description: 'Jumps to the specified target address and stores the return address in $ra.',
        pdfPage: 0,
    },
    jr: {
        usage: 'jr $s',
        description: 'Jumps to the address contained in register $s.',
        pdfPage: 0,
    },
    jalr: {
        usage: 'jalr $d, $s',
        description: 'Jumps to the address in register $s and stores the return address in register $d (typically $ra).',
        pdfPage: 0,
    },
    lb: {
        usage: 'lb $t, offset($s)',
        description: 'Loads a byte from memory at the address computed by ($s + offset) into register $t.',
        pdfPage: 0,
    },
    lh: {
        usage: 'lh $t, offset($s)',
        description: 'Loads a half-word from memory at the address computed by ($s + offset) into register $t.',
        pdfPage: 0,
    },
    lw: {
        usage: 'lw $t, offset($s)',
        description: 'Loads a word from memory at the address computed by ($s + offset) into register $t.',
        pdfPage: 0,
    },
    lbu: {
        usage: 'lbu $t, offset($s)',
        description: 'Loads an unsigned byte from memory at the address computed by ($s + offset) into register $t.',
        pdfPage: 0,
    },
    lhu: {
        usage: 'lhu $t, offset($s)',
        description: 'Loads an unsigned half-word from memory at the address computed by ($s + offset) into register $t.',
        pdfPage: 0,
    },
    sb: {
        usage: 'sb $t, offset($s)',
        description: 'Stores the least significant byte of register $t into memory at the address computed by ($s + offset).',
        pdfPage: 0,
    },
    sh: {
        usage: 'sh $t, offset($s)',
        description: 'Stores a half-word from register $t into memory at the address computed by ($s + offset).',
        pdfPage: 0,
    },
    sw: {
        usage: 'sw $t, offset($s)',
        description: 'Stores a word from register $t into memory at the address computed by ($s + offset).',
        pdfPage: 0,
    }
};

function getStoredDocs() {
    var stored = localStorage.getItem('files');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (err) {
            return [{ name: 'Untitled.asm', content: '.data\n\n.text\n' }];
        }
    }
    return [{ name: 'Untitled.asm', content: '.data\n\n.text\n' }];
}

function Editor({ onPdfOpen }) {
    const [docs, setDocs] = useState(getStoredDocs());
    const [currentDoc, setCurrentDoc] = useState(0);
    const [editingDoc, setEditingDoc] = useState(-1);
    const [docRename, setDocRename] = useState('');

    useEffect(() => {
        localStorage.setItem('files', JSON.stringify(docs));
    }, [docs]);

    function editorMount(editor, monaco) {
        const validInstructions = new Set([
            "add", "addu", "sub", "subu", "and", "or", "xor", "nor", "slt", "sltu",
            "addi", "addiu", "andi", "ori", "xori", "lui", "sll", "srl", "sra",
            "sllv", "srlv", "srav", "beq", "bne", "blez", "bgtz", "bltz", "bgez",
            "j", "jal", "jr", "jalr", "lb", "lh", "lw", "lbu", "lhu", "sb", "sh", "sw",
            "li", "la", "move", "syscall", ""
        ]);
        const validAnnotation = new Set([
            ".data", ".text",
        ]);
        const validRegisters = new Set([
            "$zero", "$at",
            "$v0", "$v1",
            "$a0", "$a1", "$a2", "$a3",
            "$t0", "$t1", "$t2", "$t3", "$t4", "$t5", "$t6", "$t7",
            "$s0", "$s1", "$s2", "$s3", "$s4", "$s5", "$s6", "$s7",
            "$t8", "$t9",
            "$k0", "$k1",
            "$gp", "$sp", "$fp", "$ra"
        ]);
        const labels = new Set(); // Store all labels

        function validateCode() {
            const model = editor.getModel();
            if (!model) return;


            const text = model.getValue();
            const errors = [];


            const lines = text.split("\n");
            lines.forEach((line, index) => {
                const tokens = line.trim().split(/\s+/);
                const match = line.match(/^\s*/);
                const startColumn = (match ? match[0].length : 0) + 1;
                let position = startColumn; // Track position in line

                // console.log("Collected labels:", Array.from(labels));

                if (tokens.length > 0 && !validInstructions.has(tokens[0]) && !validAnnotation.has(tokens[0])) {
                        // Check if token contains ':'
                        if (tokens[0].endsWith(":")) {
                            labels.add(tokens[0].slice(0, -1)); // Store valid label (like msg:)
                            return; // Skip further validation for this line
                        }
                }
                console.log("Collected labels:", Array.from(labels));


                if (tokens.length > 0 && !validInstructions.has(tokens[0]) && !validAnnotation.has(tokens[0])) {
                    if (tokens[0] === "#") {
                        return;
                    }
                    errors.push({
                        startLineNumber: index + 1,
                        startColumn: startColumn,
                        endLineNumber: index + 1,
                        endColumn: position + tokens[0].length,
                        message: `"${tokens[0]}" is not a valid MIPS instruction (initial)).`,
                        severity: monaco.MarkerSeverity.Error,
                    });
                }

                // Move position forward after the instruction
                position += tokens[0].length + 1;

                // Validate registers (removing commas)
                for (let i = 1; i < tokens.length; i++) {
                    const register = tokens[i].replace(/,/, "");
                    if (register === "#") {
                        return;
                    }
                    if (!isNaN(register) && Number.isInteger(Number(register))) {
                        continue; // Skip integer values
                    }
                    let startPos = line.indexOf(tokens[i], position - 1) + 1; // Find exact position
                    let endPos = startPos + tokens[i].length;
                    if (!validRegisters.has(register) && !labels.has(register)) {
                        errors.push({
                            startLineNumber: index + 1,
                            startColumn: startPos,
                            endLineNumber: index + 1,
                            endColumn: endPos,
                            message: `"${tokens[i]}" is not a valid MIPS Register from (continues).`,
                            severity: monaco.MarkerSeverity.Error,
                        });
                    }
                    position = endPos + 1; // Move to next token position
                }
            });


            monaco.editor.setModelMarkers(model, "mips", errors);
        }


        editor.onDidChangeModelContent(validateCode);


        validateCode();



        monaco.languages.registerHoverProvider('mips', {
            provideHover: function(model, pos) {
                const token = model.getWordAtPosition(pos);
                if (token) {
                    const key = token.word.toLowerCase();
                    const detail = instructionDetails[key];
                    if (detail) {
                        return {
                            contents: [
                                { value: '**' + token.word + '**' },
                                { value: 'Usage: `' + detail.usage + '`' },
                                { value: 'Description: ' + detail.description },
                                { value: 'Page: ' + (detail.pdfPage || 1) }
                            ]
                        };
                    }
                }
                return null;
            }
        });

        editor.addAction({
            id: 'open-instruction-manual',
            label: 'Open Instruction Manual',
            contextMenuGroupId: 'navigation',
            contextMenuOrder: 1,
            run: function(ed) {
                const pos = ed.getPosition();
                const token = ed.getModel().getWordAtPosition(pos);
                if (token) {
                    const key = token.word.toLowerCase();
                    const detail = instructionDetails[key];
                    if (detail) {
                        const page = detail.pdfPage > 0 ? detail.pdfPage : 1;
                        if (onPdfOpen) {
                            onPdfOpen(page);
                        }
                    }
                }
            }
        });
    }

    function editorChange(newContent) {
        const updatedDocs = docs.slice();
        updatedDocs[currentDoc].content = newContent;
        setDocs(updatedDocs);
    }

    function createDoc() {
        const newDoc = { name: 'File' + (docs.length + 1) + '.asm', content: '.data\n\n.text\n' };
        const updatedDocs = docs.slice();
        updatedDocs.push(newDoc);
        setDocs(updatedDocs);
        setCurrentDoc(updatedDocs.length - 1);
    }

    function removeDoc(index) {
        if (window.confirm('Delete ' + docs[index].name + '?')) {
            const updatedDocs = docs.slice();
            updatedDocs.splice(index, 1);
            if (updatedDocs.length === 0) {
                updatedDocs.push({ name: 'Untitled.asm', content: '.data\n\n.text\n' });
                setCurrentDoc(0);
            } else if (currentDoc >= updatedDocs.length) {
                setCurrentDoc(updatedDocs.length - 1);
            }
            setDocs(updatedDocs);
        }
    }

    function handleImport(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                const newDoc = { name: file.name, content: ev.target.result };
                const updatedDocs = docs.slice();
                updatedDocs.push(newDoc);
                setDocs(updatedDocs);
                setCurrentDoc(updatedDocs.length - 1);
            };
            reader.readAsText(file);
        }
    }

    function handleExport() {
        const current = docs[currentDoc];
        const blob = new Blob([current.content], { type: 'text/plain' });
        const fileURL = URL.createObjectURL(blob);
        const aLink = document.createElement('a');
        aLink.href = fileURL;
        aLink.download = current.name;
        document.body.appendChild(aLink);
        aLink.click();
        document.body.removeChild(aLink);
        URL.revokeObjectURL(fileURL);
    }

    function initiateRename(index) {
        setEditingDoc(index);
        setDocRename(docs[index].name);
    }

    function commitRename() {
        if (docRename.trim() !== '') {
            const updatedDocs = docs.slice();
            updatedDocs[editingDoc].name = docRename;
            setDocs(updatedDocs);
        }
        setEditingDoc(-1);
        setDocRename('');
    }

    function cancelRename() {
        setEditingDoc(-1);
        setDocRename('');
    }

    let docButtons = [];
    for (let i = 0; i < docs.length; i++) {
        const isEditing = i === editingDoc;
        const btnContent = isEditing ? (
            <>
                <input value={docRename} onChange={e => setDocRename(e.target.value)} style={{ marginRight: '2px' }}/>
                <button onClick={commitRename}>OK</button>
                <button onClick={cancelRename}>Cancel</button>
            </>
        ) : (
            <>
                <button onClick={() => setCurrentDoc(i)}>{docs[i].name}</button>
                <button onClick={() => removeDoc(i)}>x</button>
                <button onClick={() => initiateRename(i)}>rename</button>
            </>
        );
        docButtons.push(<span key={i} style={{ marginRight: '4px' }}>{btnContent}</span>);
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', width: "70%" }}>
            <div style={{ background: '#333', padding: '8px' }}>
                {docButtons}
                <button onClick={createDoc}>New File</button>
                <button>
                    <label style={{ marginLeft: '8px', cursor: 'pointer' }}>
                        Import
                        <input type="file" accept=".asm" onChange={handleImport} style={{ display: 'none' }} />
                    </label>
                </button>
                <button onClick={handleExport} style={{ marginLeft: '8px' }}>Export</button>
            </div>
            <div style={{ flex: 1 }}>
                <MonacoEditor
                    height="100%"
                    width="100%"
                    language="mips"
                    theme="vs-dark"
                    value={docs[currentDoc].content}
                    onMount={editorMount}
                    onChange={editorChange}
                    options={{ automaticLayout: true }}
                />
            </div>
        </div>
    );
}

export default Editor;