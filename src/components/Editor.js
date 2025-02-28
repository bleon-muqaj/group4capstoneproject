import React, {useState, useEffect} from 'react';
import MonacoEditor from '@monaco-editor/react';
import RegisterDisplay from "./RegisterDisplay";

const instructionDetails = {
    add: {//not implemented in mimic
        usage: 'add $d, $s, $t',
        description: 'Adds registers $s and $t and stores the result in $d.',
        pdfPage: 0,
    },
    addu: {
        usage: 'addu $d, $s, $t',
        description: 'Adds registers $s and $t without checking for overflow.',
        pdfPage: 48,
    },
    sub: {//not implemented in mimic
        usage: 'sub $d, $s, $t',
        description: 'Subtracts register $t from register $s and stores the result in $d.',
        pdfPage: 0,
    },
    subu: {//not implemented in mimic
        usage: 'subu $d, $s, $t',
        description: 'Subtracts registers $s and $t without checking for overflow.',
        pdfPage: 0,
    },
    and: {//not implemented in mimic
        usage: 'and $d, $s, $t',
        description: 'Performs a bitwise AND on registers $s and $t, storing the result in $d.',
        pdfPage: 0,
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
        pdfPage: 0,
    },
    slt: {
        usage: 'slt $d, $s, $t',
        description: 'Sets register $d to 1 if register $s is less than register $t; otherwise, sets it to 0.',
        pdfPage: 388,
    },
    sltu: {//not implemented in mimic
        usage: 'sltu $d, $s, $t',
        description: 'Sets register $d to 1 if register $s is less than register $t (unsigned), otherwise 0.',
        pdfPage: 0,
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
        pdfPage: 0,
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
        pdfPage: 0,
    },
    sra: {//not implemented in mimic
        usage: 'sra $d, $t, shamt',
        description: 'Shifts register $t right arithmetically by shamt bits and stores the result in $d.',
        pdfPage: 0,
    },
    sllv: {//not implemented in mimic
        usage: 'sllv $d, $t, $s',
        description: 'Shifts register $t left by the number of bits specified in register $s and stores the result in $d.',
        pdfPage: 0,
    },
    srlv: {//not implemented in mimic
        usage: 'srlv $d, $t, $s',
        description: 'Shifts register $t right logically by the number of bits specified in register $s and stores the result in $d.',
        pdfPage: 0,
    },
    srav: {//not implemented in mimic
        usage: 'srav $d, $t, $s',
        description: 'Shifts register $t right arithmetically by the number of bits specified in register $s and stores the result in $d.',
        pdfPage: 0,
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
        pdfPage: 0,
    },
    bgtz: {//not implemented in mimic
        usage: 'bgtz $s, offset',
        description: 'Branches to the given offset if register $s is greater than zero.',
        pdfPage: 0,
    },
    bltz: {//not implemented in mimic
        usage: 'bltz $s, offset',
        description: 'Branches to the given offset if register $s is less than zero.',
        pdfPage: 0,
    },
    bgez: {//not implemented in mimic
        usage: 'bgez $s, offset',
        description: 'Branches to the given offset if register $s is greater than or equal to zero.',
        pdfPage: 0,
    },
    j: {
        usage: 'j target',
        description: 'Jumps to the specified target address.',
        pdfPage: 204,
    },
    jal: {//not implemented in mimic
        usage: 'jal target',
        description: 'Jumps to the specified target address and stores the return address in $ra.',
        pdfPage: 0,
    },
    jr: {//not implemented in mimic
        usage: 'jr $s',
        description: 'Jumps to the address contained in register $s.',
        pdfPage: 0,
    },
    jalr: {///not implemented in mimic
        usage: 'jalr $d, $s',
        description: 'Jumps to the address in register $s and stores the return address in register $d (typically $ra).',
        pdfPage: 0,
    },
    lb: {//not implemented in mimic
        usage: 'lb $t, offset($s)',
        description: 'Loads a byte from memory at the address computed by ($s + offset) into register $t.',
        pdfPage: 0,
    },
    lh: {//not implemented in mimic
        usage: 'lh $t, offset($s)',
        description: 'Loads a half-word from memory at the address computed by ($s + offset) into register $t.',
        pdfPage: 0,
    },
    lw: {//not implemented in mimic
        usage: 'lw $t, offset($s)',
        description: 'Loads a word from memory at the address computed by ($s + offset) into register $t.',
        pdfPage: 0,
    },
    lbu: {//not implemented in mimic
        usage: 'lbu $t, offset($s)',
        description: 'Loads an unsigned byte from memory at the address computed by ($s + offset) into register $t.',
        pdfPage: 0,
    },
    lhu: {//not implemented in mimic
        usage: 'lhu $t, offset($s)',
        description: 'Loads an unsigned half-word from memory at the address computed by ($s + offset) into register $t.',
        pdfPage: 0,
    },
    sb: {//not implemented in mimic
        usage: 'sb $t, offset($s)',
        description: 'Stores the least significant byte of register $t into memory at the address computed by ($s + offset).',
        pdfPage: 0,
    },
    sh: {//not implemented in mimic
        usage: 'sh $t, offset($s)',
        description: 'Stores a half-word from register $t into memory at the address computed by ($s + offset).',
        pdfPage: 0,
    },
    sw: {//not implemented in mimic
        usage: 'sw $t, offset($s)',
        description: 'Stores a word from register $t into memory at the address computed by ($s + offset).',
        pdfPage: 0,
    }
};

// passed into RegisterDisplay if the user has not run their code
const dummyRegisterValues = new Array(32).fill(0);
// $sp register initial value
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

function Editor({onPdfOpen}) {
    const [docs, setDocs] = useState(getStoredDocs());
    const [currentDoc, setCurrentDoc] = useState(0);
    const [editingDoc, setEditingDoc] = useState(-1);
    const [docRename, setDocRename] = useState('');
    const [output, setOutput] = useState('');
    const [currentTab, setCurrentTab] = useState('editor');
    const [registerValues, setRegisterValues] = useState(null);

    useEffect(() => {
        localStorage.setItem('files', JSON.stringify(docs));
    }, [docs]);

    function editorMount(editor, monaco) {
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

    function editorChange(newContent) {
        const updatedDocs = docs.slice();
        updatedDocs[currentDoc].content = newContent;
        setDocs(updatedDocs);
    }

    function createDoc() {
        const newDoc = {name: 'File' + (docs.length + 1) + '.asm', content: '.data\n\n.text\n'};
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
                updatedDocs.push({name: 'Untitled.asm', content: '.data\n\n.text\n'});
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
            reader.onload = function (ev) {
                const newDoc = {name: file.name, content: ev.target.result};
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
        const blob = new Blob([current.content], {type: 'text/plain'});
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

    function handleTabChange() {
        if (currentTab === 'editor') setCurrentTab('registers')
        else setCurrentTab('editor');
    }

    // runCode function remains unchanged.
    async function runCode() {
        const currentCode = docs[currentDoc].content;
        try {
            const response = await fetch("http://localhost:3030/assemble", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({code: currentCode})
            });
            const data = await response.json();
            let outputText = "";
            outputText += "Execution Status: " + data.execution_status + "\n\n";
            if (data.errors) {
                outputText += "Errors: " + data.errors + "\n\n";
            }
            outputText += "Machine Code:\n" + data.machine_code + "\n";
            outputText += "Text Dump (hex-only):\n" + data.text_dump + "\n";
            outputText += "Text Dump (ASCII, reversed):\n" + data.text_dump_friendly + "\n";
            outputText += "Data Dump (hex-only):\n" + data.data_dump + "\n";
            outputText += "Data Dump (ASCII, reversed):\n" + data.data_dump_friendly + "\n";
            if (data.syscall_output) {
                outputText += "\nSyscall Output:\n" + data.syscall_output + "\n";
            }
            if (data.register_dump) {
                outputText += "\nRegister Dump:\n";
                data.register_dump.forEach((reg, index) => {
                    outputText += `$${index}: ${reg}\n`;
                });
                console.log(data.register_dump);
                setRegisterValues(data.register_dump);
            }
            setOutput(outputText);
        } catch (error) {
            console.error("Error running code:", error);
            setOutput("Error running code: " + error.message);
        }
    }

    function selectDoc(i) {
        setCurrentDoc(i);
        setCurrentTab('editor');
    }

    let docButtons = [];
    for (let i = 0; i < docs.length; i++) {
        const isEditing = i === editingDoc;
        const btnContent = isEditing ? (
            <>
                <input value={docRename} onChange={e => setDocRename(e.target.value)} style={{marginRight: '2px'}}/>
                <button onClick={commitRename}>OK</button>
                <button onClick={cancelRename}>Cancel</button>
            </>
        ) : (
            <>
                <button onClick={() => selectDoc(i)}>{docs[i].name}</button>
                <button onClick={() => removeDoc(i)}>x</button>
                <button onClick={() => initiateRename(i)}>rename</button>
            </>
        );
        docButtons.push(<span key={i} style={{marginRight: '4px'}}>{btnContent}</span>);
    }

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            width: "100%"
        }}>
            <div style={{background: '#333', padding: '8px'}}>
                {docButtons}
                <button onClick={createDoc}>New File</button>
                <button onClick={runCode}>Run</button>
                <button>
                    <label style={{marginLeft: '8px', cursor: 'pointer'}}>
                        Import
                        <input type="file" accept=".asm" onChange={handleImport} style={{display: 'none'}}/>
                    </label>
                </button>
                <button onClick={handleExport} style={{marginLeft: '8px'}}>Export</button>
                <button onClick={handleTabChange}>{currentTab === 'editor' ? 'View Registers' : 'View Editor'}</button>
            </div>
            <div style={{
                flex: 1,
                display: currentTab === 'editor' ? 'flex' : 'none',
                flexDirection: 'row'
            }}>
                <div style={{flex: 1}}>
                    <MonacoEditor
                        height="100%"
                        width="100%"
                        language="mips"
                        theme="vs-dark"
                        value={docs[currentDoc].content}
                        onMount={editorMount}
                        onChange={editorChange}
                        options={{automaticLayout: true}}
                    />
                </div>
                <div style={{
                    width: '400px',
                    background: 'black',
                    color: 'white',
                    padding: '8px',
                    fontFamily: 'monospace',
                    overflowY: 'auto'
                }}>
                    <h3 style={{margin: '0 0 8px 0'}}>Console Output:</h3>
                    <pre style={{margin: 0}}>{output}</pre>
                </div>
            </div>
            <div style={{
                display: currentTab === 'registers' ? 'flex' : 'none',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <RegisterDisplay registerValues={registerValues ? registerValues : dummyRegisterValues}/>
            </div>
        </div>
    );
}

export default Editor;