import React, { useState, useRef } from "react";
import PDFViewer from "./PDFViewer";

function Header({ toggleTheme, isDarkMode, fontSize, setFontSize, onToggleLineNumbers, isPdfOpen, setIsPdfOpen, lastViewedPage }) {
    const chapters = [
        { title: "Table of Contents", page: 1 },
        { title: "Instructions", page: 3 },
        { title: "add", page: 43 },
        { title: "addi", page: 45 },
        { title: "addiu", page: 46 },
        { title: "addu", page: 48 },
        { title: "and", page: 54 },
        { title: "andi", page: 55 },
        { title: "beq", page: 82 },
        { title: "bgez", page: 85 },
        { title: "bgtz", page: 98 },
        { title: "blez", page: 104 },
        { title: "bltz", page: 107 },
        { title: "bne", page: 113 },
        { title: "j", page: 204 },
        { title: "jal", page: 205 },
        { title: "jalr", page: 206 },
        { title: "jr", page: 216 },
        { title: "lb", page: 221 },
        { title: "lbu", page: 223 },
        { title: "lh", page: 229 },
        { title: "lhu", page: 231 },
        { title: "lui", page: 243 },
        { title: "lw", page: 245 },
        { title: "nor", page: 323 },
        { title: "or", page: 324 },
        { title: "ori", page: 325 },
        { title: "sb", page: 354 },
        { title: "sh", page: 383 },
        { title: "sll", page: 386 },
        { title: "sllv", page: 387 },
        { title: "slt", page: 388 },
        { title: "sltu", page: 391 },
        { title: "sra", page: 393 },
        { title: "srav", page: 394 },
        { title: "srl", page: 395 },
        { title: "srlv", page: 396 },
        { title: "sub", page: 398 },
        { title: "subu", page: 400 },
        { title: "sw", page: 402 },
        { title: "syscall", page: 425 },
        { title: "xor", page: 456 },
        { title: "xori", page: 457 }
    ];

    const [showLineNumbers, setShowLineNumbers] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const handleToggleLineNumbers = () => {
        const newValue = !showLineNumbers;
        setShowLineNumbers(newValue);
        if (onToggleLineNumbers) onToggleLineNumbers(newValue);
    };

    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [size, setSize] = useState({ width: 600, height: 400 });
    const [dragging, setDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    function startDrag(e) {
        setDragging(true);
        document.body.style.userSelect = "none";
        dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }

    function handleDrag(e) {
        if (dragging) {
            setPosition({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
        }
    }

    function stopDrag() {
        setDragging(false);
        document.body.style.userSelect = "";
    }

    return (
        <header
            className="header"
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px" }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <div className="header-title">MIPS Simulator</div>
                <button onClick={() => setIsPdfOpen(true)} className="open-manual-button">
                    View Manual
                </button>

            </div>
            {isPdfOpen && (
                <div
                    style={{
                        position: "fixed",
                        top: `${position.y}px`,
                        left: `${position.x}px`,
                        width: `${size.width}px`,
                        height: `${size.height}px`,
                        minWidth: "500px",
                        minHeight: "300px",
                        border: "2px solid #888",
                        backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
                        zIndex: 1000,
                        resize: "both",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                        overflow: "auto"
                    }}
                    onMouseMove={handleDrag}
                    onMouseUp={stopDrag}
                >
                    <div
                        style={{ backgroundColor: isDarkMode ? "#333" : "#ddd", padding: "4px", cursor: "move", userSelect: "none" }}
                        onMouseDown={startDrag}
                    >
                        <span>📄 MIPS Manual</span>
                        <button onClick={() => setIsPdfOpen(false)} style={{ float: "right" }}>
                            ❌
                        </button>
                    </div>
                    <PDFViewer chapters={chapters} initialPage={lastViewedPage} isDarkMode={isDarkMode} />
                </div>
            )}
            <button
                onClick={() => setShowSettings((prev) => !prev)}
                style={{
                    padding: "6px 12px",
                    borderRadius: "4px",
                    border: "none",
                    backgroundColor: isDarkMode ? "#444" : "#ccc",
                    color: isDarkMode ? "white" : "black",
                    cursor: "pointer"
                }}
            >
                ⚙️ Settings
            </button>
            {showSettings && (
                <div
                    style={{
                        position: "absolute",
                        top: "60px",
                        right: "20px",
                        backgroundColor: isDarkMode ? "#2a2a2a" : "#e0e0e0",
                        borderRadius: "6px",
                        padding: "12px",
                        zIndex: 100,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
                    }}
                >
                    <div style={{ fontSize: "16px", marginBottom: "8px", color: isDarkMode ? "white" : "black" }}>Display Settings</div>
                    <button
                        onClick={toggleTheme}
                        style={{
                            backgroundColor: isDarkMode ? "#444" : "#ccc",
                            color: isDarkMode ? "white" : "black",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            marginBottom: "8px"
                        }}
                    >
                        {isDarkMode ? "Light Mode" : "Dark Mode"}
                    </button>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "14px",
                            color: isDarkMode ? "white" : "black",
                            marginBottom: "8px"
                        }}
                    >
                        <label htmlFor="fontSizeSlider">Font Size:</label>
                        <input
                            type="range"
                            id="fontSizeSlider"
                            min="10"
                            max="30"
                            value={fontSize}
                            onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                            style={{ width: "80px" }}
                        />
                        <span>{fontSize}px</span>
                    </div>
                    <button
                        onClick={handleToggleLineNumbers}
                        style={{
                            padding: "6px 12px",
                            borderRadius: "4px",
                            border: "none",
                            backgroundColor: isDarkMode ? "#444" : "#ccc",
                            color: isDarkMode ? "white" : "black",
                            cursor: "pointer",
                            marginBottom: "8px"
                        }}
                    >
                        {showLineNumbers ? "Hide Line Numbers" : "Show Line Numbers"}
                    </button>
                    <button
                        onClick={() => setShowSettings(false)}
                        style={{
                            marginTop: "8px",
                            padding: "4px 10px",
                            backgroundColor: "#d9534f",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                        }}
                    >
                        Close
                    </button>
                </div>
            )}
        </header>
    );
}

export default Header;
