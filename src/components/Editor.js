import React, {useState, useEffect, useRef} from "react";
import MonacoEditor from "@monaco-editor/react";
import RegisterDisplay from "./RegisterDisplay";
import {TextSegmentDisplay, DataSegmentDisplay} from "./CodeContentDisplays";
import {instructionDetails} from "../data/instructionDetails";
import init, {Mips32Core, assemble_mips32, bytes_to_words} from "../mimic-wasm/pkg/mimic_wasm.js";

export async function assemble(currentCode, currentFileName, setTextDump, setDataDump, setAssembledCode, setOutput) {
    await init();
    const result = assemble_mips32(currentCode);

    if (result.failed()) {
        console.log(result.error());
        setAssembledCode(null);
        setOutput("Error: Assembly failed.");
        return;
    }

    const textWords = bytes_to_words(result.text());
    let textStr = "";
    for (const word of textWords) {
        textStr += word.toString(16).padStart(8, "0") + "\n";
    }
    setTextDump(textStr);

    const dataWords = bytes_to_words(result.data());
    let dataStr = "";
    for (const word of dataWords) {
        dataStr += word.toString(16).padStart(8, "0") + "\n";
    }
    setDataDump(dataStr);

    setAssembledCode(result);
    setOutput(`Assembly of ${currentFileName} was successful.\nYou can now run your code.\n`);
}

export const dummyRegisterValues = (() => {
    const regs = new Array(32).fill(0);
    regs[28] = 268468224;
    regs[29] = 2147479548;
    return regs;
})();

export function getStoredDocs() {
    try {
        const raw = localStorage.getItem("files");
        const parsed = JSON.parse(raw);
        return parsed && parsed.length ? parsed : [{name: "Untitled.asm", content: ".data\n\n.text\n"}];
    } catch {
        return [{name: "Untitled.asm", content: ".data\n\n.text\n"}];
    }
}

export const validInstructions = new Map([
    ["add", 3], ["addu", 3], ["sub", 3], ["subu", 3], ["and", 3], ["or", 3], ["xor", 3], ["nor", 3], ["slt", 3], ["sltu", 3],
    ["addi", 3], ["addiu", 3], ["andi", 3], ["ori", 3], ["xori", 3], ["lui", 2],
    ["sll", 3], ["srl", 3], ["sra", 3], ["sllv", 3], ["srlv", 3], ["srav", 3],
    ["beq", 3], ["bne", 3], ["blez", 2], ["bgtz", 2], ["bltz", 2], ["bgez", 2],
    ["j", 1], ["jal", 1], ["jr", 1], ["jalr", 2],
    ["lb", 3], ["lh", 3], ["lw", 3], ["lbu", 3], ["lhu", 3],
    ["sb", 3], ["sh", 3], ["sw", 3],
    ["li", 2], ["la", 2], ["move", 2],
    ["syscall", 0]
]);

export const validAnnotations = new Set([".data", ".text"]);

export const validRegisters = new Set([
    "$zero",
    "$at",
    "$v0",
    "$v1",
    "$a0",
    "$a1",
    "$a2",
    "$a3",
    "$t0",
    "$t1",
    "$t2",
    "$t3",
    "$t4",
    "$t5",
    "$t6",
    "$t7",
    "$s0",
    "$s1",
    "$s2",
    "$s3",
    "$s4",
    "$s5",
    "$s6",
    "$s7",
    "$t8",
    "$t9",
    "$k0",
    "$k1",
    "$gp",
    "$sp",
    "$fp",
    "$ra"
]);

export const labels = new Set();

export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function Editor({fontSize, onPdfOpen, isDarkMode, showLineNumbers = true}) {
    const [docs, setDocs] = useState(getStoredDocs());
    const [showFileMenu, setShowFileMenu] = useState(false);
    const [currentDoc, setCurrentDoc] = useState(0);
    const [output, setOutput] = useState("");
    const [registerValues, setRegisterValues] = useState(dummyRegisterValues);
    const [previousRegisters, setPreviousRegisters] = useState(dummyRegisterValues);
    const [changedRegisters, setChangedRegisters] = useState(new Array(32).fill(false));
    const [textDump, setTextDump] = useState("");
    const [dataDump, setDataDump] = useState("");
    const [editingDoc, setEditingDoc] = useState(-1);
    const [docRename, setDocRename] = useState("");
    const [assembledCode, setAssembledCode] = useState(null);
    const [currentTab, setCurrentTab] = useState("edit");
    const [executionFinished, setExecutionFinished] = useState(false);
    const lineCounterRef = useRef(0);
    const [showTextAscii, setShowTextAscii] = useState(false);
    const [showDataAscii, setShowDataAscii] = useState(false);
    const [errors, setErrors] = useState([]);
    const [breakpoints, setBreakpoints] = useState(new Set());
    const [currentLine, setCurrentLine] = useState(null);
    const editorRef = useRef(null);
    const coreRef = useRef(null);
    const [executionDelay, setExecutionDelay] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const isPausedRef = useRef(isPaused);
    const isRunningRef = useRef(isRunning);
    const [allBreakpointsEnabled, setAllBreakpointsEnabled] = useState(false);
    const [runAllowed, setRunAllowed] = useState(true);
    const [editorWidth, setEditorWidth] = useState(70);
    const [registerDisplayHeight, setRegisterDisplayHeight] = useState(70);
    const [isDragging, setIsDragging] = useState(false);
    // BUTTON DROPDOWN
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, docIndex: null });
    // FILE BUTTON DROPDOWN USE EFFECT
    useEffect(() => {
        const handleClick = () => {
            if (contextMenu.visible) {
                setContextMenu((prev) => ({ ...prev, visible: false }));
            }
        };
        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);
    }, [contextMenu.visible]);


    useEffect(() => {
        isPausedRef.current = isPaused;
        isRunningRef.current = isRunning;
    }, [isPaused, isRunning]);

    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.updateOptions({lineNumbers: showLineNumbers ? "on" : "off"});
        }
    }, [showLineNumbers]);

    useEffect(() => {
        localStorage.setItem("files", JSON.stringify(docs));
    }, [docs]);

    useEffect(() => {
        setTextDump("");
        setDataDump("");
        setAssembledCode(null);
        setOutput("");
        setRegisterValues(dummyRegisterValues);
        setChangedRegisters(new Array(32).fill(false));
    }, [currentDoc]);

    function validateCode(editor, monaco) {
        const model = editor.getModel();
        if (!model) return;

        const text = model.getValue();
        const lines = text.split("\n");
        const errs = [];
        labels.clear();

        lines.forEach((line) => {
            const tokens = line.trim().split(/\s+/);
            if (tokens.length && !validInstructions.has(tokens[0]) && !validAnnotations.has(tokens[0])) {
                if (tokens[0].endsWith(":")) labels.add(tokens[0].slice(0, -1));
            }
        });

        lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#")) return;

            const tokens = trimmed.split(/\s+/);
            const match = line.match(/^\s*/);
            const startColumn = (match ? match[0].length : 0) + 1;
            let position = startColumn;

            const instr = tokens[0];

            if (!validInstructions.has(instr) && !validAnnotations.has(instr)) {
                if (instr.endsWith(":")) {
                    labels.add(instr.slice(0, -1));
                    return;
                }
                errs.push({
                    startLineNumber: index + 1,
                    startColumn,
                    endLineNumber: index + 1,
                    endColumn: position + instr.length,
                    message: `"${instr}" is not a valid MIPS instruction.`,
                    severity: monaco.MarkerSeverity.Error
                });
            }

            position += instr.length + 1;

            for (let i = 1; i < tokens.length; i++) {
                const token = tokens[i].replace(/,/, "");
                if (token.startsWith("#")) return;
                if (!isNaN(token) && Number.isInteger(Number(token))) continue;

                const startPos = line.indexOf(tokens[i], position - 1) + 1;
                const endPos = startPos + tokens[i].length;

                if (!validRegisters.has(token) && !labels.has(token)) {
                    errs.push({
                        startLineNumber: index + 1,
                        startColumn: startPos,
                        endLineNumber: index + 1,
                        endColumn: endPos,
                        message: `"${token}" is not a valid MIPS Register or Label.`,
                        severity: monaco.MarkerSeverity.Error
                    });
                }
                position += tokens[i].length + 1;
            }
        });

        lines.forEach((line, index) => {
            const codePart = line.split("#")[0];
            const tokens = codePart.trim().split(/\s+/);
            const match = line.match(/^\s*/);
            const startColumn = (match ? match[0].length : 0) + 1;

            if (tokens.length > 0 && validInstructions.has(tokens[0])) {
                const instr = tokens[0];
                const expectedArgs = validInstructions.get(instr);
                const actualArgs = tokens.length > 1 ? tokens.slice(1).filter(t => t !== ",").length : 0;

                if (expectedArgs !== undefined && actualArgs < expectedArgs) {
                    errs.push({
                        startLineNumber: index + 1,
                        startColumn,
                        endLineNumber: index + 1,
                        endColumn: startColumn + instr.length,
                        message: `"${instr}" expects ${expectedArgs} argument(s), but got ${actualArgs}.`,
                        severity: monaco.MarkerSeverity.Error
                    });
                }
            }
        });

        monaco.editor.setModelMarkers(model, "mips", errs);
        setErrors(errs);
    }


    function toggleBreakpoint(line) {
        setBreakpoints((prev) => {
            const updated = new Set(prev);
            updated.has(line) ? updated.delete(line) : updated.add(line);
            return updated;
        });
    }

    function readStringFromMemory(startAddress, heapBytes) {
        const baseAddress = 0x10010000;
        const heapOffset = startAddress - baseAddress;
        if (heapOffset < 0 || heapOffset >= heapBytes.length) return "[Invalid address]";
        let str = "";
        for (let i = heapOffset; i < heapBytes.length; i++) {
            const byte = heapBytes[i];
            if (byte === 0) break;
            str += String.fromCharCode(byte);
        }
        return str || "[Empty string]";
    }

    async function run() {
        if (!assembledCode) return;

        setPreviousRegisters(registerValues);
        setExecutionFinished(false);
        setOutput("");
        setRegisterValues(dummyRegisterValues);
        setChangedRegisters(new Array(32).fill(false));

        const core = new Mips32Core();
        core.load_text(assembledCode.text());
        core.load_data(assembledCode.data());

        coreRef.current = core;
        lineCounterRef.current = 0;
        core._dataBytes = assembledCode.data();

        const step = async () => {
            if (executionFinished || !isRunningRef.current) return;
            if (isPausedRef.current) {
                requestAnimationFrame(step);
                return;
            }

            const isSyscall = core.tick();
            lineCounterRef.current += 1;
            setCurrentLine(lineCounterRef.current);

            const regs = core.dump_registers();
            const v0 = regs[2];
            const a0 = regs[4];
            let newOutput = "";

            if (isSyscall) {
                if (v0 === 1) newOutput += a0.toString() + "\n";
                else if (v0 === 4) newOutput += readStringFromMemory(a0, core._dataBytes || []);
                else if (v0 === 10) {
                    newOutput += "Exit\n";
                    setExecutionFinished(true);
                    setIsRunning(false);
                    isRunningRef.current = false;
                    setRunAllowed(true);
                    return;
                } else newOutput += "Unknown syscall\n";
                setOutput((prev) => prev + newOutput);
            }

            const newRegisters = [...regs];
            setRegisterValues((prev) => {
                const changed = newRegisters.map((val, i) => val !== prev[i]);
                setChangedRegisters(changed);
                return newRegisters;
            });

            if (executionDelay > 0) await sleep(executionDelay);
            requestAnimationFrame(step);
        };

        setIsRunning(true);
        isRunningRef.current = true;
        setIsPaused(false);
        isPausedRef.current = false;
        step();
    }

    async function runToNextBreakpoint() {
        if (!assembledCode || executionFinished) return;

        if (!coreRef.current) {
            const core = new Mips32Core();
            core.load_text(assembledCode.text());
            core.load_data(assembledCode.data());
            coreRef.current = core;
            core._dataBytes = assembledCode.data();
            lineCounterRef.current = 0;
            setOutput("");
        }

        const core = coreRef.current;
        const breakSet = new Set(breakpoints);

        const step = async () => {
            if (executionFinished || !isRunningRef.current) return;
            if (isPausedRef.current) {
                requestAnimationFrame(step);
                return;
            }

            const currentIndex = lineCounterRef.current;
            if (breakSet.has(currentIndex) && currentIndex !== currentLine) {
                setCurrentLine(currentIndex);
                setIsRunning(false);
                isRunningRef.current = false;
                setRunAllowed(false);
                return;
            }

            const isSyscall = core.tick();
            lineCounterRef.current += 1;
            setCurrentLine(lineCounterRef.current);

            const regs = core.dump_registers();
            const v0 = regs[2];
            const a0 = regs[4];
            let newOutput = "";

            if (isSyscall) {
                if (v0 === 1) newOutput += a0.toString() + "\n";
                else if (v0 === 4) newOutput += readStringFromMemory(a0, core._dataBytes || []);
                else if (v0 === 10) {
                    newOutput += "Exit\n";
                    setExecutionFinished(true);
                    setIsRunning(false);
                    isRunningRef.current = false;
                    return;
                } else newOutput += "Unknown syscall\n";
                setOutput((prev) => prev + newOutput);
            }

            const newRegisters = [...regs];
            setRegisterValues((prev) => {
                const changed = newRegisters.map((val, i) => val !== prev[i]);
                setChangedRegisters(changed);
                return newRegisters;
            });

            if (executionDelay > 0) await sleep(executionDelay);
            requestAnimationFrame(step);
        };

        setIsRunning(true);
        isRunningRef.current = true;
        setIsPaused(false);
        isPausedRef.current = false;
        step();
    }

    async function stepInstruction() {
        if (!assembledCode || executionFinished) return;

        if (!coreRef.current) {
            const core = new Mips32Core();
            core.load_text(assembledCode.text());
            core.load_data(assembledCode.data());
            coreRef.current = core;
            lineCounterRef.current = 0;
            setOutput("");
        }

        const core = coreRef.current;
        let consoleOutput = "";

        const isSyscall = core.tick();
        lineCounterRef.current += 1;

        const regs = core.dump_registers();
        const v0 = regs[2];
        const a0 = regs[4];
        const staticData = assembledCode.data();

        if (isSyscall) {
            if (v0 === 1) consoleOutput += a0.toString() + "\n";
            else if (v0 === 4) {
                const offset = a0 - 0x10010000;
                if (offset < 0 || offset >= staticData.length) consoleOutput += "[Invalid address]\n";
                else {
                    let str = "";
                    for (let i = offset; i < staticData.length; i++) {
                        const byte = staticData[i];
                        if (byte === 0) break;
                        str += String.fromCharCode(byte);
                    }
                    consoleOutput += str || "[Empty string]";
                }
            } else if (v0 === 10) {
                consoleOutput += "Exit\n";
                setExecutionFinished(true);
            } else consoleOutput += "Unknown syscall\n";
        }

        setCurrentLine(lineCounterRef.current);

        const newRegisters = [...regs];
        setRegisterValues((prev) => {
            const changedRegisters = newRegisters.map((val, i) => val !== prev[i]);
            setChangedRegisters(changedRegisters);
            return newRegisters;
        });

        setOutput((prev) => prev + consoleOutput);
    }

    function editorChange(newContent) {
        const updatedDocs = [...docs];
        updatedDocs[currentDoc].content = newContent;
        setDocs(updatedDocs);
    }

    function editorMount(editor, monaco) {
        editor.onDidChangeModelContent(() => validateCode(editor, monaco));
        validateCode(editor, monaco);

        monaco.languages.registerHoverProvider("mips", {
            provideHover(model, pos) {
                const token = model.getWordAtPosition(pos);
                if (token) {
                    const key = token.word.toLowerCase();
                    const detail = instructionDetails[key];
                    if (detail) {
                        return {
                            contents: [
                                {value: `**${token.word}**`},
                                {value: `Usage: \`${detail.usage}\``},
                                {value: `Description: ${detail.description}`},
                                {value: `Page: ${detail.pdfPage || 1}`}
                            ]
                        };
                    }
                }
                return null;
            }
        });

        editor.addAction({
            id: "open-instruction-manual",
            label: "Open Instruction Manual",
            contextMenuGroupId: "navigation",
            contextMenuOrder: 1,
            run(ed) {
                const pos = ed.getPosition();
                const token = ed.getModel().getWordAtPosition(pos);
                if (token) {
                    const key = token.word.toLowerCase();
                    const detail = instructionDetails[key];
                    if (detail) {
                        const page = detail.pdfPage > 0 ? detail.pdfPage : 1;
                        if (onPdfOpen) onPdfOpen(page);
                    }
                }
            }
        });
    }

    async function assembleCode() {
        if (errors.length) {
            let errorOutput = `Assembly of ${docs[currentDoc].name} failed.\n`;
            errors.forEach((e) => (errorOutput += `Error at line ${e.startLineNumber} column ${e.startColumn}: ${e.message}\n`));
            setOutput(errorOutput);
            return;
        }

        const currentCode = docs[currentDoc].content;
        const currentFileName = docs[currentDoc].name;
        try {
            setExecutionFinished(false);
            setRegisterValues(dummyRegisterValues);
            setChangedRegisters(new Array(32).fill(false));
            coreRef.current = null;
            await assemble(currentCode, currentFileName, setTextDump, setDataDump, setAssembledCode, setOutput);
            setCurrentTab("execute");
            setRunAllowed(true);
        } catch (error) {
            console.error(error);
        }
    }

    async function runCode() {
        if (!assembledCode) {
            console.log("Error: Code has not been assembled");
            return;
        }
        setPreviousRegisters(registerValues);
        try {
            await run();
        } catch (error) {
            console.error(error);
        }
    }

    function handleDownload(data, fileName) {
        const blob = new Blob([data], {type: "text/plain"});
        const fileURL = URL.createObjectURL(blob);
        const aLink = document.createElement("a");
        aLink.href = fileURL;
        aLink.download = fileName;
        document.body.appendChild(aLink);
        aLink.click();
        document.body.removeChild(aLink);
        URL.revokeObjectURL(fileURL);
    }

    function handleImport(e) {
        const file = e.target.files[0];
        if (file) {
            const fileReader = new FileReader();
            fileReader.onload = (event) => {
                const newDoc = {name: file.name, content: event.target.result};
                const updatedDocs = docs.slice();
                updatedDocs.push(newDoc);
                setDocs(updatedDocs);
                setCurrentDoc(updatedDocs.length - 1);
            };
            fileReader.readAsText(file);
        }
    }

    function createDoc() {
        const newDoc = {name: `File${docs.length + 1}.asm`, content: ".data\n\n.text\n"};
        setDocs([...docs, newDoc]);
        setCurrentDoc(docs.length);
    }

    function removeDoc(index) {
        if (window.confirm(`Delete ${docs[index].name}?`)) {
            const updatedDocs = docs.filter((_, i) => i !== index);
            setDocs(updatedDocs.length ? updatedDocs : [{name: "Untitled.asm", content: ".data\n\n.text\n"}]);
            setCurrentDoc(0);
        }
    }

    function initiateRename(index) {
        setEditingDoc(index);
        setDocRename(docs[index].name);
    }

    function commitRename() {
        if (docRename.trim() !== "") {
            const updatedDocs = [...docs];
            updatedDocs[editingDoc].name = docRename;
            setDocs(updatedDocs);
        }
        setEditingDoc(-1);
        setDocRename("");
    }

    function cancelRename() {
        setEditingDoc(-1);
        setDocRename("");
    }

    function selectDoc(i) {
        setCurrentDoc(i);
        setCurrentTab("edit");
    }

    function selectCodeExample(event) {
        const choice = event.target.value;
        if (choice === "hello_world") {
            const newDoc = {
                name: "Hello_World.asm",
                content:
                    ".data\n" +
                    "    message: .asciiz \"Hello, World!\\n\"\n" +
                    "\n" +
                    ".text\n" +
                    "        li $v0, 4\n" +
                    "        la $a0, message\n" +
                    "        syscall\n" +
                    "\n" +
                    "        li $v0, 10\n" +
                    "        syscall"
            };
            setDocs([...docs, newDoc]);
            setCurrentDoc(docs.length);
            document.getElementById("example").selectedIndex = 0;
        } else if (choice === "add") {
            const newDoc = {
                name: "add.asm",
                content:
                    ".data\n" +
                    "    sum_msg: .asciiz \"Sum: \"\n" +
                    "\n" +
                    ".text\n" +
                    "    li $t0, 10\n" +
                    "    li $t1, 5\n" +
                    "    addiu $t2, $t0, 5\n" +
                    "    li $v0, 4\n" +
                    "    la $a0, sum_msg\n" +
                    "    syscall\n" +
                    "    li $v0, 1\n" +
                    "    move $a0, $t2\n" +
                    "    syscall\n" +
                    "    li $v0, 10\n" +
                    "    syscall\n"
            };
            setDocs([...docs, newDoc]);
            setCurrentDoc(docs.length);
            document.getElementById("example").selectedIndex = 0;
        }
    }

    function toggleAllBreakpoints() {
        if (!assembledCode) return;
        const lines = textDump.trim().split("\n");
        const totalLines = lines.length;
        if (allBreakpointsEnabled) {
            setBreakpoints(new Set());
            setAllBreakpointsEnabled(false);
        } else {
            const newBreakpoints = new Set();
            for (let i = 0; i < totalLines; i++) newBreakpoints.add(i);
            setBreakpoints(newBreakpoints);
            setAllBreakpointsEnabled(true);
        }
    }

    function handleEditorResize(e) {
        e.preventDefault();
        const beginX = e.clientX;
        const beginWidth = editorWidth;

        const onMouseMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - beginX;
            const containerWidth = document.body.clientWidth;
            const newWidth = ((beginWidth / 100) * containerWidth + deltaX) / containerWidth * 100;
            setEditorWidth(Math.min(90, Math.max(40, newWidth)));
        };

        const onMouseUp = () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    }

    function handleRegisterResize(e) {
        e.preventDefault();
        const beginY = e.clientY;
        const containerHeight = document.body.clientHeight;
        const beginHeight = registerDisplayHeight;

        const onMouseMove = (moveEvent) => {
            const deltaY = moveEvent.clientY - beginY;
            const newHeight = ((beginHeight / 100) * containerHeight - deltaY) / containerHeight * 100;
            setRegisterDisplayHeight(Math.min(90, Math.max(40, newHeight)));
        };

        const onMouseUp = () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        setIsDragging(true);
    }

    function handleDragLeave(e) {
        e.preventDefault();
        setIsDragging(false);
    }

    function handleDrop(e) {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith(".asm")) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const newDoc = {name: file.name, content: event.target.result};
                setDocs((prevDocs) => [...prevDocs, newDoc]);
                setCurrentDoc(docs.length);
            };
            reader.readAsText(file);
        } else alert("Please drop a valid .asm file!");
    }

    useEffect(() => {
        const preventDefault = (e) => e.preventDefault();
        window.addEventListener("dragover", preventDefault);
        window.addEventListener("drop", preventDefault);
        return () => {
            window.removeEventListener("dragover", preventDefault);
            window.removeEventListener("drop", preventDefault);
        };
    }, []);

    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                width: "100%",
                backgroundColor: isDarkMode ? "#121212" : "#ffffff",
                color: isDarkMode ? "#ffffff" : "#000000"
            }}
        >
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                    background: isDarkMode ? "#333" : "#f5f5f5",
                    padding: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    border: isDragging ? "2px dashed #4CAF50" : "2px dashed transparent",
                    transition: "border 0.2s ease"
                }}
            >
                <div style={{display: "flex", gap: "12px", alignItems: "center"}}>
                    <div style={{position: "relative"}}>
                        <button onClick={() => setShowFileMenu((prev) => !prev)}>📁 File ▾</button>
                        {showFileMenu && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: "100%",
                                    left: 0,
                                    background: isDarkMode ? "#444" : "#fff",
                                    border: "1px solid #ccc",
                                    borderRadius: "4px",
                                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                                    zIndex: 1000,
                                    padding: "8px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "6px"
                                }}
                            >
                                <button onClick={createDoc}>📄 New File</button>
                                <button>
                                    <label style={{cursor: "pointer", display: "block", width: "100%"}}>
                                        ⬆️ Import .asm
                                        <input type="file" accept=".asm" onChange={handleImport}
                                               style={{display: "none"}}/>
                                    </label>
                                </button>
                                <button
                                    onClick={() => handleDownload(docs[currentDoc].content, `${docs[currentDoc].name}`)}>⬇️
                                    Download .asm
                                </button>
                                <button onClick={() => handleDownload(dataDump, "data_dump.txt")}>⬇️ Download .data
                                </button>
                                <button onClick={() => handleDownload(textDump, "text_dump.txt")}>⬇️ Download .text
                                </button>
                            </div>
                        )}
                    </div>
                    <select name="example" id="example" onChange={selectCodeExample} defaultValue="">
                        <option value="" disabled hidden>
                            Select Example
                        </option>
                        <option value="hello_world">Hello World</option>
                        <option value="add">Add Two Numbers</option>
                    </select>
                </div>
                <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
                    <label htmlFor="speedSlider">⚡ Speed:</label>
                    <input id="speedSlider" type="range" min="0" max="1000" step="100" value={executionDelay}
                           onChange={(e) => setExecutionDelay(Number(e.target.value))}/>
                    <span>{executionDelay} ms</span>
                </div>
            </div>
            <div
                style={{
                    background: isDarkMode ? "#333" : "#f5f5f5",
                    padding: "4px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "4px"
                }}
            >
                {/*delete/rename buttons START*/}
                {docs.map((doc, i) => (
                    <div
                        key={i}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            border: "1px solid #ccc",
                            borderRadius: "12px",
                            padding: "2px 6px",
                            background: currentDoc === i ? (isDarkMode ? "#555" : "#ddd") : isDarkMode ? "#222" : "#fff",
                            gap: "4px",
                            position: "relative",
                        }}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            setContextMenu({
                                visible: true,
                                x: e.pageX,
                                y: e.pageY,
                                docIndex: i,
                            });
                        }}
                    >
                        {editingDoc === i ? (
                            <>
                                <input
                                    value={docRename}
                                    onChange={(e) => setDocRename(e.target.value)}
                                    style={{ borderRadius: "4px", fontSize: "12px" }}
                                />
                                <button onClick={commitRename}>✔</button>
                                <button onClick={cancelRename}>✖</button>
                            </>
                        ) : (
                            <button onClick={() => selectDoc(i)}>{doc.name}</button>
                        )}
                    </div>
                ))}
            {/*file deleet/rename END*/}

            {/*    CONTEXT MENU START*/}
                {contextMenu.visible && (
                    <div
                        style={{
                            position: "absolute",
                            top: contextMenu.y,
                            left: contextMenu.x,
                            background: isDarkMode ? "#444" : "#fff",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                            zIndex: 1000,
                            padding: "4px 10px",
                            width: "fit-content",
                            minWidth: "60px",
                            boxSizing: "border-box",
                        }}
                        onClick={() => setContextMenu({ ...contextMenu, visible: false })}
                    >
                        <button
                            onClick={() => {
                                initiateRename(contextMenu.docIndex);
                                setContextMenu({ ...contextMenu, visible: false });
                            }}
                            style={{
                                padding: "6px 6px",
                                textAlign: "left",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                width: "100%",
                                color: isDarkMode ? "#ddd" : "#222",
                                fontSize: "13px",
                                borderRadius: "4px",
                                boxSizing: "border-box",
                            }}
                            onMouseEnter={(e) => (e.target.style.background = isDarkMode ? "#555" : "#eee")}
                            onMouseLeave={(e) => (e.target.style.background = "none")}
                        >
                            ✎ Rename
                        </button>
                        <button
                            onClick={() => {
                                removeDoc(contextMenu.docIndex);
                                setContextMenu({ ...contextMenu, visible: false });
                            }}
                            style={{
                                padding: "6px 8px", // Even padding for both buttons
                                textAlign: "left",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                width: "100%",
                                color: isDarkMode ? "#faa" : "#a00",
                                fontSize: "13px",
                                borderRadius: "4px",
                                boxSizing: "border-box",
                            }}
                            onMouseEnter={(e) => (e.target.style.background = isDarkMode ? "#661111" : "#ffe6e6")}
                            onMouseLeave={(e) => (e.target.style.background = "none")}
                        >
                            ✖ Delete
                        </button>
                    </div>
                )}

                {/*    context MENU (BUTTON DROPDOWN) END^^*/}
            </div>
            <div
                style={{
                    background: isDarkMode ? "#333" : "#f5f5f5",
                    padding: "8px",
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap"
                }}
            >
                <button onClick={() => setCurrentTab("edit")}>✏️ Edit</button>
                <button onClick={() => setCurrentTab("execute")}>▶️ Execute View</button>
                <button onClick={assembleCode} disabled={isRunning || isPaused}>
                    ⚙️ Assemble
                </button>
                <button onClick={run} disabled={!assembledCode || executionFinished || isRunning || !runAllowed}>
                    ▶️ Run
                </button>
                <button onClick={stepInstruction} disabled={!assembledCode || executionFinished || isRunning}>
                    ⏭️ Step
                </button>
                <button onClick={runToNextBreakpoint} disabled={!assembledCode || executionFinished || isRunning}>
                    ⏩ Run to BP
                </button>
                <button onClick={() => {
                    setIsPaused(true);
                    isPausedRef.current = true;
                }} disabled={!isRunning || isPaused}>
                    ⏸️ Pause
                </button>
                <button onClick={() => {
                    setIsPaused(false);
                    isPausedRef.current = false;
                }} disabled={!isRunning || !isPaused}>
                    ▶️ Resume
                </button>
                <button
                    onClick={() => {
                        setIsRunning(false);
                        isRunningRef.current = false;
                        setIsPaused(false);
                        isPausedRef.current = false;
                        setExecutionFinished(true);
                        setRunAllowed(true);
                    }}
                    disabled={!isRunning}
                >
                    ⏹️ Stop
                </button>
                <button onClick={toggleAllBreakpoints} disabled={!assembledCode}>
                    {allBreakpointsEnabled ? "🚫 Clear BPs" : "🎯 Set BPs"}
                </button>
            </div>
            <div style={{flex: 1, display: "flex", overflow: "hidden"}}>
                <div style={{display: currentTab === "edit" ? "flex" : "none", flex: editorWidth, minWidth: "0px"}}>
                    <MonacoEditor
                        height="100%"
                        width="100%"
                        language="mips"
                        theme={isDarkMode ? "vs-dark" : "vs-light"}
                        value={docs[currentDoc].content}
                        onChange={editorChange}
                        options={{automaticLayout: true, lineNumbers: showLineNumbers ? "on" : "off", fontSize}}
                        onMount={editorMount}
                    />
                </div>
                <div style={{
                    display: currentTab === "execute" ? "flex" : "none",
                    flex: editorWidth,
                    flexDirection: "column",
                    minWidth: "0px"
                }}>
                    {assembledCode ? (
                        <>
                            <p>Text Segment</p>
                            <TextSegmentDisplay textDump={textDump} breakpoints={breakpoints}
                                                toggleBreakpoint={toggleBreakpoint} currentLine={currentLine}
                                                showAscii={showTextAscii}/>
                            <button onClick={() => setShowTextAscii((prev) => !prev)}>Show
                                as {showTextAscii ? "Hex" : "Instructions"}</button>
                            <p>Data Segment</p>
                            <DataSegmentDisplay dataDump={dataDump} showAscii={showDataAscii}/>
                            <button onClick={() => setShowDataAscii((prev) => !prev)}>Show
                                as {showDataAscii ? "Hex" : "ASCII"}</button>
                        </>
                    ) : (
                        <p>Assemble your code to view text and data content.</p>
                    )}
                </div>
                <div style={{width: "3px", cursor: "col-resize", background: isDarkMode ? "#444" : "#ccc"}}
                     onMouseDown={handleEditorResize}/>
                <div style={{
                    flex: 100 - editorWidth,
                    minWidth: "250px",
                    display: "flex",
                    flexDirection: "column",
                    background: isDarkMode ? "#222" : "#f5f5f5"
                }}>
                    <div style={{
                        padding: "8px",
                        fontFamily: "monospace",
                        height: `${100 - registerDisplayHeight}%`,
                        overflowY: "auto",
                        background: isDarkMode ? "black" : "#f5f5f5"
                    }}>
                        <h3>Console Output:</h3>
                        <pre>{output}</pre>
                    </div>
                    <div onMouseDown={handleRegisterResize}
                         style={{height: "3px", cursor: "row-resize", background: isDarkMode ? "#444" : "#ccc"}}/>
                    <div style={{
                        padding: "8px",
                        flex: 1,
                        height: `${registerDisplayHeight}%`,
                        overflowY: "auto",
                        background: isDarkMode ? "#222" : "#ddd"
                    }}>
                        <h3>Registers:</h3>
                        <RegisterDisplay registerValues={registerValues} changedRegisters={changedRegisters}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Editor;
