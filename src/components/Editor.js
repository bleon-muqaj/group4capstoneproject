import React, {useState, useEffect} from 'react';
import MonacoEditor from '@monaco-editor/react';
import RegisterDisplay from "./RegisterDisplay";
import {TextSegmentDisplay, DataSegmentDisplay} from "./CodeContentDisplays";
import {instructionDetails} from '../data/instructionDetails';
import init, {Mips32Core, assemble_mips32, bytes_to_words} from '../mimic-wasm/pkg/mimic_wasm.js';

async function assemble(currentCode, setTextDump, setDataDump, setAssembledCode, setOutput) {
    await init();

    const assemble_result = assemble_mips32(currentCode);

    if (assemble_result.failed()) {
        console.log(assemble_result.error());
        setAssembledCode(null);
        setOutput('Error: Assembly failed.')
        return;
    } else {
        let text_str = "";
        const text = bytes_to_words(assemble_result.text());
        for (const i in text) {
            text_str += text[i].toString(16).padStart(8, '0') + "\n";
        }
        setTextDump(text_str);

        let data_str = "";
        const data = bytes_to_words(assemble_result.data());
        for (const i in data) {
            data_str += data[i].toString(16).padStart(8, '0') + "\n";
        }
        setDataDump(data_str);
    }

    setAssembledCode(assemble_result);
    setOutput('Assembly was successful.')
}

async function run(assembledCode, setRegisterValues, setOutput, setTextDump, setDataDump, prevRegisters, setChangedRegisters) {
    let consoleOutput = '';

    let core = new Mips32Core();
    core.load_text(assembledCode.text());
    core.load_data(assembledCode.data());

    let running = true;

    while (running) {
        // core.tick() returns true if a syscall was called
        if (core.tick()) {
            let regs = core.dump_registers();
            switch (regs[2]) {
                case 4:
                    console.log("Print String");
                    consoleOutput += 'Print String\n';
                    break;

                case 10:
                    console.log("Exit");
                    consoleOutput += 'Exit\n';
                    running = false;
                    break;

                default:
                    console.log("Unknown syscall");
                    consoleOutput += 'Unknown syscall\n';
                    break;
            }
        }
    }
    const newRegisters = [...core.dump_registers()];
    setRegisterValues((prev) => {
        const changedRegisters = newRegisters.map((val, i) => val !== prev[i]);
        setChangedRegisters(changedRegisters);
        return newRegisters;
    });
    setOutput(consoleOutput);
}

const dummyRegisterValues = new Array(32).fill(0);
dummyRegisterValues[28] = 268468224;
dummyRegisterValues[29] = 2147479548;

function getStoredDocs() {
    const stored = localStorage.getItem('files');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (err) {
            return [{name: 'Untitled.asm', content: '.data\n\n.text\n'}];
        }
    }
    return [{name: 'Untitled.asm', content: '.data\n\n.text\n'}];
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

const labels = new Set(); // Store all labels

function validateCode(editor, monaco) {
    const model = editor.getModel();
    if (!model) return;

    const text = model.getValue();
    const lines = text.split("\n");
    const errors = [];
    labels.clear();

    lines.forEach((line, index) => { // collect all labels before underlining
        // console.log("Collected labels:", Array.from(labels));
        const tokens = line.trim().split(/\s+/);
        if (tokens.length > 0 && !validInstructions.has(tokens[0]) && !validAnnotations.has(tokens[0])) {
            if (tokens[0].endsWith(":")) {
                labels.add(tokens[0].slice(0, -1));
            }
        }
    });

    lines.forEach((line, index) => {

        const trimmed = line.trim();
        if (trimmed === "") return;
        if (trimmed.startsWith("#")) return; // Entire comment line

        const tokens = line.trim().split(/\s+/);
        const match = line.match(/^\s*/);
        const startColumn = (match ? match[0].length : 0) + 1;
        let position = startColumn;

        if (tokens.length > 0 && !validInstructions.has(tokens[0]) && !validAnnotations.has(tokens[0])) {
            if (tokens[0].endsWith(":")) {
                labels.add(tokens[0].slice(0, -1));
                return;
            }
        }

        if (tokens.length > 0 && !validInstructions.has(tokens[0]) && !validAnnotations.has(tokens[0])) {
            if (tokens[0].startsWith("#")) return; // Comment after code

            errors.push({
                startLineNumber: index + 1,
                startColumn: startColumn,
                endLineNumber: index + 1,
                endColumn: position + tokens[0].length,
                message: `"${tokens[0]}" is not a valid MIPS instruction.`,
                severity: monaco.MarkerSeverity.Error,
            });
        }

        position += tokens[0].length + 1;

        for (let i = 1; i < tokens.length; i++) {
            const register = tokens[i].replace(/,/, "");
            if (register.startsWith("#")) return; // Ignore rest of line if comment begins
            if (!isNaN(register) && Number.isInteger(Number(register))) continue;

            let startPos = line.indexOf(tokens[i], position - 1) + 1;
            let endPos = startPos + tokens[i].length;
            if (!validRegisters.has(register) && !labels.has(register)) {
                errors.push({
                    startLineNumber: index + 1,
                    startColumn: startPos,
                    endLineNumber: index + 1,
                    endColumn: endPos,
                    message: `"${tokens[i]}" is not a valid MIPS Register or Label.`,
                    severity: monaco.MarkerSeverity.Error,
                });
            }
            position += tokens[i].length + 1;
        }
    });
    // });

    monaco.editor.setModelMarkers(model, "mips", errors);
}


function Editor({onPdfOpen, isDarkMode}) {
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
    const [assembledCode, setAssembledCode] = useState(null);
    const [currentTab, setCurrentTab] = useState('edit');

    useEffect(() => {
        console.log('Data Dump', dataDump)
        console.log(dataDump.slice(0, -1).split('\n'));
    }, [dataDump])

    useEffect(() => {
        localStorage.setItem('files', JSON.stringify(docs));
    }, [docs]);

    useEffect(() => {
        // Clear relevant state when switching to a new document
        setTextDump('');
        setDataDump('');
        setAssembledCode(null);
        setOutput('');
        setRegisterValues(dummyRegisterValues);
        setChangedRegisters(new Array(32).fill(false));
    }, [currentDoc]);


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
        monaco.languages.registerHoverProvider('mips', {
            provideHover: function (model, pos) {
                const token = model.getWordAtPosition(pos);
                if (token) {
                    const key = token.word.toLowerCase();
                    const detail = instructionDetails[key];
                    if (detail) {
                        return {
                            contents: [
                                {value: '**' + token.word + '**'},
                                {value: 'Usage: `' + detail.usage + '`'},
                                {value: 'Description: ' + detail.description},
                                {value: 'Page: ' + (detail.pdfPage || 1)}
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
            run: function (ed) {
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

    async function assembleCode() {
        const currentCode = docs[currentDoc].content;
        try {
            setRegisterValues(dummyRegisterValues);
            setChangedRegisters(new Array(32).fill(false));
            await assemble(currentCode, setTextDump, setDataDump, setAssembledCode, setOutput);
        } catch (error) {
            console.error(error);
        }
    }

    async function runCode() {
        if (!assembledCode) {
            console.log('Error: Code has not been assembled')
            return;
        }
        setPreviousRegisters(registerValues);
        try {
            await run(assembledCode, setRegisterValues, setOutput, setTextDump, setDataDump, registerValues, setChangedRegisters);
            setAssembledCode(null);
        } catch (error) {
            console.error(error);
        }
    }

    function handleDownload(data, fileName) {
        const blob = new Blob([data], {type: 'text/plain'});
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
        const newDoc = {name: `File${docs.length + 1}.asm`, content: '.data\n\n.text\n'};
        setDocs([...docs, newDoc]);
        setCurrentDoc(docs.length);
    }

    function removeDoc(index) {
        if (window.confirm(`Delete ${docs[index].name}?`)) {
            const updatedDocs = docs.filter((_, i) => i !== index);
            setDocs(updatedDocs.length ? updatedDocs : [{name: 'Untitled.asm', content: '.data\n\n.text\n'}]);
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
        setCurrentTab('edit');
    }

    function selectCodeExample(event) {
        const choice = event.target.value; // Get the selected value
        if (choice === "hello_world") {
            // console.log("Executing Hello World logic...");
            const newDoc = {name: `Hello_World.asm`, content:
                    '.data\n' +
                    '    message: .asciiz "Hello, World!\\n"\n' +
                    '\n' +
                    '.text\n' +
                    '        # Print the message\n' +
                    '        li $v0, 4           # Syscall for printing a string\n' +
                    '        la $a0, message     # Load address of the message into $a0\n' +
                    '        syscall             # Make syscall to print the string\n' +
                    '\n' +
                    '        # Exit the program\n' +
                    '        li $v0, 10          # Syscall for program exit\n' +
                    '        syscall             # Make syscall to exit'};
            setDocs([...docs, newDoc]);
            setCurrentDoc(docs.length);
            document.getElementById('example').selectedIndex = 0
        }
        else if (choice === "add") {
            const newDoc = {name: `add.asm`, content:
                    '.data\n' +
                    '    sum_msg: .asciiz "Sum: "\n' +
                    '\n' +
                    '.text\n' +
                    '    # Initialize two numbers\n' +
                    '    li $t0, 10   # First number\n' +
                    '    li $t1, 5    # Second number\n' +
                    '\n' +
                    '    # Perform addition using addiu\n' +
                    '    addiu $t2, $t0, 5  # $t2 = $t0 + 5\n' +
                    '\n' +
                    '    # Print sum message\n' +
                    '    li $v0, 4\n' +
                    '    la $a0, sum_msg\n' +
                    '    syscall\n' +
                    '\n' +
                    '    # Print sum result\n' +
                    '    li $v0, 1\n' +
                    '    move $a0, $t2\n' +
                    '    syscall\n' +
                    '\n' +
                    '    # Exit program\n' +
                    '    li $v0, 10\n' +
                    '    syscall\n'};
            setDocs([...docs, newDoc]);
            setCurrentDoc(docs.length);
            document.getElementById('example').selectedIndex = 0
        }else {
            console.log("Unknown selection.");
        }
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
            <div style={{
                background: isDarkMode ? '#333' : '#f5f5f5',
                padding: '8px',
                display: 'flex',
                flexWrap: 'wrap',
                flexShrink: 0
            }}>
                <label htmlFor="example">Code Examples:</label>
                <select name="example" id="example" style={{marginLeft: '4px'}} onChange={selectCodeExample}>
                    <option value="" disabled selected hidden>Select An Code Example Here</option>
                    <option value="hello_world" >Hello World</option>
                    <option value="add">Add Two Numbers</option>
                </select>
            </div>

            <div style={{
                background: isDarkMode ? '#333' : '#f5f5f5',
                padding: '8px',
                display: 'flex',
                flexWrap: 'wrap',
                flexShrink: 0
            }}>
                <button onClick={() => setCurrentTab('edit')}>Edit</button>
                <button onClick={() => setCurrentTab('execute')}>Execute</button>
            </div>

            <div style={{
                background: isDarkMode ? '#333' : '#f5f5f5',
                padding: '8px',
                display: 'flex',
                flexWrap: 'wrap',
                flexShrink: 0
            }}>
                {docs.map((doc, i) => (
                    <span key={i} style={{marginRight: '4px'}}>
                        {editingDoc === i ? (
                            <>
                                <input value={docRename} onChange={e => setDocRename(e.target.value)}
                                       style={{marginRight: '2px'}}/>
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
                <button onClick={assembleCode}>Assemble</button>
                <button onClick={runCode} disabled={!assembledCode}>Run</button>
                <button onClick={() => handleDownload(docs[currentDoc].content, `${docs[currentDoc].name}`)}>Download
                    .asm
                </button>
                <button onClick={() => handleDownload(dataDump, "data_dump.txt")}>Download .data</button>
                <button onClick={() => handleDownload(textDump, "text_dump.txt")}>Download .text</button>
            </div>

            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'row',
                overflow: 'hidden'
            }}>
                <div style={{display: currentTab === 'edit' ? 'flex' : 'none', flex: 3, minWidth: '0px'}}>
                    <MonacoEditor
                        height="100%"
                        width="100%"
                        language="mips"
                        theme={isDarkMode ? "vs-dark" : "vs-light"}
                        value={docs[currentDoc].content}
                        onChange={editorChange}
                        options={{automaticLayout: true}}
                        onMount={editorMount}
                    />
                </div>
                <div style={{
                    display: currentTab === 'execute' ? 'flex' : 'none',
                    flex: 3,
                    flexDirection: 'column',
                    minWidth: '0px'
                }}>
                    {assembledCode ? (<><p>Text Segment</p> <TextSegmentDisplay textDump={textDump}/> <p>Data
                            Segment</p> <DataSegmentDisplay dataDump={dataDump}/> </>) :
                        <p>Assemble your code to view text and data content.</p>}
                </div>
                <div style={{
                    flex: 1,
                    minWidth: '250px',
                    display: 'flex',
                    flexDirection: 'column',
                    background: isDarkMode ? "#222" : "#f5f5f5",
                    color: isDarkMode ? "white" : "black"
                }}>
                    <div style={{
                        background: isDarkMode ? 'black' : '#f5f5f5',
                        color: isDarkMode ? 'white' : 'black',
                        padding: '8px',
                        fontFamily: 'monospace',
                        height: '150px',
                        overflowY: 'auto'
                    }}>
                        <h3 style={{margin: '0 0 8px 0'}}>Console Output:</h3>
                        <pre style={{margin: 0}}>{output}</pre>
                    </div>

                    <div style={{
                        background: isDarkMode ? '#222' : '#ddd',
                        color: isDarkMode ? 'white' : 'black',
                        padding: '8px',
                        flex: 1,
                        overflowY: 'auto'
                    }}>
                        <h3 style={{margin: '0 0 8px 0'}}>Registers:</h3>
                        <RegisterDisplay registerValues={registerValues} changedRegisters={changedRegisters}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Editor;
