import React, {useState, useEffect} from 'react';
import MonacoEditor from '@monaco-editor/react';
import RegisterDisplay from "./RegisterDisplay";
import {instructionDetails} from '../data/instructionDetails';
import init, {Mips32Core, AssemblerResult, assemble_mips32, bytes_to_words} from '../mimic-wasm/pkg/mimic_wasm.js';

async function run(currentCode, storeRegisterValues, setConsoleOutput) {
    await init();

    const assemble_result = assemble_mips32(currentCode);

    let consoleOutput = '';

    if (assemble_result.failed()) {
        console.log(assemble_result.error());
        consoleOutput += assemble_result.error();
        setConsoleOutput(consoleOutput);
        return;
    } else {
        let text_str = "Text:\n";
        const text = bytes_to_words(assemble_result.text());
        for (const i in text) {
            text_str += text[i].toString(16).padStart(8, '0') + "\n";
        }
        console.log(text_str);
        consoleOutput += text_str + '\n';

        let data_str = "Data:\n";
        const data = bytes_to_words(assemble_result.data());
        for (const i in data) {
            data_str += data[i].toString(16).padStart(8, '0') + "\n";
        }
        console.log(data_str);
        consoleOutput += data_str + '\n';
    }

    let core = new Mips32Core();
    core.load_text(assemble_result.text());
    core.load_data(assemble_result.data());

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
    console.log(core.dump_registers());
    storeRegisterValues(core.dump_registers());
    setConsoleOutput(consoleOutput);
}

// passed into RegisterDisplay if the user has not run their code
const dummyRegisterValues = new Array(32).fill(0);
// $sp register initial value
dummyRegisterValues[29] = 2147479548;
console.log(dummyRegisterValues);

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

    // storeRegisterValues and setConsoleOutput allow us to utilize the useEffect hooks,
    // another solution could be to implement 'run' as a local function
    function storeRegisterValues(newRegisterValues) {
        setRegisterValues(newRegisterValues);
    }

    function setConsoleOutput(newOutput) {
        setOutput(newOutput);
    }

    async function runCode() {
        const currentCode = docs[currentDoc].content;
        try {
            await run(currentCode, storeRegisterValues, setConsoleOutput);
        } catch (error) {
            console.log(error);
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