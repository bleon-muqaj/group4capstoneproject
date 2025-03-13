import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import RegisterDisplay from "./RegisterDisplay";
import { instructionDetails } from '../data/instructionDetails';

const API_URL = "http://127.0.0.1:3030/assemble";

async function run(code, storeRegisterValues, setConsoleOutput, setTextDump, setDataDump, prevRegisters, setChangedRegisters) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
    });

    const result = await response.json();
    let consoleOutput = '';

    if (result.errors) {
        consoleOutput += `Error: ${result.errors}\n`;
    } else {
        consoleOutput += result.syscall_output || "";
        const newRegisters = result.register_dump || new Array(32).fill(0);

        // Compare old vs new register values
        const changedRegisters = newRegisters.map((val, i) => val !== prevRegisters[i]);
        setChangedRegisters(changedRegisters);

        storeRegisterValues(newRegisters);
        setTextDump(result.text_dump || "");
        setDataDump(result.data_dump || "");
    }

    setConsoleOutput(consoleOutput);
}

const dummyRegisterValues = new Array(32).fill(0);
dummyRegisterValues[29] = 2147479548;

function getStoredDocs() {
    const stored = localStorage.getItem('files');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (err) {
            return [{ name: 'Untitled.asm', content: '.data\n\n.text\n' }];
        }
    }
    return [{ name: 'Untitled.asm', content: '.data\n\n.text\n' }];
}

const validInstructions = new Set([
    "add", "addu", "sub", "subu", "and", "or", "xor", "nor", "slt", "sltu",
    "addi", "addiu", "andi", "ori", "xori", "lui", "sll", "srl", "sra",
    "sllv", "srlv", "srav", "beq", "bne", "blez", "bgtz", "bltz", "bgez",
    "j", "jal", "jr", "jalr", "lb", "lh", "lw", "lbu", "lhu", "sb", "sh", "sw",
    "li", "la", "move", "syscall"
]);

const validAnnotations = new Set([".data", ".text"]);

const validRegisters = new Set([
    "$zero", "$at", "$v0", "$v1", "$a0", "$a1", "$a2", "$a3", "$t0", "$t1",
    "$t2", "$t3", "$t4", "$t5", "$t6", "$t7", "$s0", "$s1", "$s2", "$s3",
    "$s4", "$s5", "$s6", "$s7", "$t8", "$t9", "$k0", "$k1", "$gp", "$sp", "$fp", "$ra"
]);

function validateCode(editor, monaco) {
    const model = editor.getModel();
    if (!model) return;

    const text = model.getValue();
    const lines = text.split("\n");
    const errors = [];

    lines.forEach((line, index) => {
        // Skip blank lines (or lines with only whitespace)
        if (line.trim() === "") return;

        const tokens = line.trim().split(/\s+/);
        let position = line.match(/^\s*/)?.[0].length + 1;

        if (!validInstructions.has(tokens[0]) && !validAnnotations.has(tokens[0])) {
            if (!tokens[0].endsWith(":") && tokens[0] !== "#") {
                errors.push({
                    startLineNumber: index + 1,
                    startColumn: position,
                    endLineNumber: index + 1,
                    endColumn: position + tokens[0].length,
                    message: `"${tokens[0]}" is not a valid MIPS instruction.`,
                    severity: monaco.MarkerSeverity.Error,
                });
            }
        }

        position += tokens[0].length + 1;

        for (let i = 1; i < tokens.length; i++) {
            const register = tokens[i].replace(/,/, "");
            if (register.startsWith("$") && !validRegisters.has(register)) {
                let startPos = line.indexOf(tokens[i], position - 1) + 1;
                let endPos = startPos + tokens[i].length;
                errors.push({
                    startLineNumber: index + 1,
                    startColumn: startPos,
                    endLineNumber: index + 1,
                    endColumn: endPos,
                    message: `"${tokens[i]}" is not a valid MIPS register.`,
                    severity: monaco.MarkerSeverity.Error,
                });
            }
            position += tokens[i].length + 1;
        }
    });

    monaco.editor.setModelMarkers(model, "mips", errors);
}

function Editor({ isDarkMode }) {
    const [docs, setDocs] = useState(getStoredDocs());
    const [currentDoc, setCurrentDoc] = useState(0);
    const [output, setOutput] = useState('');
    const [registerValues, setRegisterValues] = useState(dummyRegisterValues);
    const [previousRegisters, setPreviousRegisters] = useState(dummyRegisterValues);
    const [changedRegisters, setChangedRegisters] = useState(new Array(32).fill(false));
    const [textDump, setTextDump] = useState('');
    const [dataDump, setDataDump] = useState('');
    const [editingDoc, setEditingDoc] = useState(-1);
    const [docRename, setDocRename] = useState('');

    useEffect(() => {
        localStorage.setItem('files', JSON.stringify(docs));
    }, [docs]);

    function editorChange(newContent) {
        const updatedDocs = [...docs];
        updatedDocs[currentDoc].content = newContent;
        setDocs(updatedDocs);
    }

    function editorMount(editor, monaco) {
        editor.onDidChangeModelContent(() => {
            validateCode(editor, monaco);
        });
        validateCode(editor, monaco);
    }

    async function runCode() {
        setPreviousRegisters([...registerValues]); // Store previous registers before execution
        const currentCode = docs[currentDoc].content;
        try {
            await run(currentCode, setRegisterValues, setOutput, setTextDump, setDataDump, previousRegisters, setChangedRegisters);
        } catch (error) {
            console.error(error);
        }
    }

    function handleDownload(data, fileName) {
        const blob = new Blob([data], { type: 'text/plain' });
        const fileURL = URL.createObjectURL(blob);
        const aLink = document.createElement('a');
        aLink.href = fileURL;
        aLink.download = fileName;
        document.body.appendChild(aLink);
        aLink.click();
        document.body.removeChild(aLink);
        URL.revokeObjectURL(fileURL);
    }

    function createDoc() {
        const newDoc = { name: `File${docs.length + 1}.asm`, content: '.data\n\n.text\n' };
        setDocs([...docs, newDoc]);
        setCurrentDoc(docs.length);
    }

    function removeDoc(index) {
        if (window.confirm(`Delete ${docs[index].name}?`)) {
            const updatedDocs = docs.filter((_, i) => i !== index);
            setDocs(updatedDocs.length ? updatedDocs : [{ name: 'Untitled.asm', content: '.data\n\n.text\n' }]);
            setCurrentDoc(0);
        }
    }

    function initiateRename(index) {
        setEditingDoc(index);
        setDocRename(docs[index].name);
    }

    function commitRename() {
        if (docRename.trim() !== '') {
            const updatedDocs = [...docs];
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

    function selectDoc(i) {
        setCurrentDoc(i);
    }

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            width: "100%",
            backgroundColor: isDarkMode ? "#121212" : "#ffffff",
            color: isDarkMode ? "#ffffff" : "#000000"
        }}>
            <div style={{ background: isDarkMode ? '#333' : '#f5f5f5', padding: '8px', display: 'flex', flexWrap: 'wrap', flexShrink: 0 }}>
                {docs.map((doc, i) => (
                    <span key={i} style={{ marginRight: '4px' }}>
                        {editingDoc === i ? (
                            <>
                                <input value={docRename} onChange={e => setDocRename(e.target.value)} style={{ marginRight: '2px' }} />
                                <button onClick={commitRename}>OK</button>
                                <button onClick={cancelRename}>Cancel</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => selectDoc(i)}>{doc.name}</button>
                                <button onClick={() => removeDoc(i)}>x</button>
                                <button onClick={() => initiateRename(i)}>Rename</button>
                            </>
                        )}
                    </span>
                ))}
                <button onClick={createDoc}>New File</button>
                <button onClick={runCode}>Run</button>
                <button onClick={() => handleDownload(docs[currentDoc].content, `${docs[currentDoc].name}`)}>Download .asm</button>
                <button onClick={() => handleDownload(dataDump, "data_dump.txt")}>Download .data</button>
                <button onClick={() => handleDownload(textDump, "text_dump.txt")}>Download .text</button>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
                <div style={{ flex: 3, minWidth: '0px' }}>
                    <MonacoEditor
                        height="100%"
                        width="100%"
                        language="mips"
                        theme={isDarkMode ? "vs-dark" : "vs-light"}
                        value={docs[currentDoc].content}
                        onChange={editorChange}
                        options={{ automaticLayout: true }}
                        onMount={editorMount}
                    />
                </div>

                <div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', background: isDarkMode ? "#222" : "#f5f5f5", color: isDarkMode ? "white" : "black" }}>
                    <div style={{
                        background: isDarkMode ? 'black' : '#f5f5f5',
                        color: isDarkMode ? 'white' : 'black',
                        padding: '8px',
                        fontFamily: 'monospace',
                        height: '150px',
                        overflowY: 'auto'
                    }}>
                        <h3 style={{ margin: '0 0 8px 0' }}>Console Output:</h3>
                        <pre style={{ margin: 0 }}>{output}</pre>
                    </div>

                    <div style={{ background: isDarkMode ? '#222' : '#ddd', color: isDarkMode ? 'white' : 'black', padding: '8px', flex: 1, overflowY: 'auto' }}>
                        <h3 style={{ margin: '0 0 8px 0' }}>Registers:</h3>
                        <RegisterDisplay registerValues={registerValues} changedRegisters={changedRegisters} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Editor;
