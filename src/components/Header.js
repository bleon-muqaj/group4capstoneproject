import React, { useState } from 'react';
import PDFViewer from "./PDFViewer";

function Header({ toggleTheme, isDarkMode, fontSize, setFontSize, onToggleLineNumbers}) {
    const [pdfOpen, setPdfOpen] = React.useState(false);

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

    const handleToggle = () => {
        const newValue = !showLineNumbers;
        setShowLineNumbers(newValue);
        if (onToggleLineNumbers) {
            onToggleLineNumbers(newValue);
        }
    };

    return (
        <header className="header" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            paddingRight: '240px' // 🛠 prevents the Display Settings box from overlapping
            }}>
            <div className="header-title">MIPS Simulator</div>

            <button onClick={() => setPdfOpen(true)} className="open-manual-button">
                View Manual
            </button>

            <div
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    backgroundColor: isDarkMode ? '#2a2a2a' : '#e0e0e0',
                    borderRadius: '6px',
                    zIndex: 10
                }}
            >
                <div
                    style={{
                        fontSize: '16px',
                        marginBottom: '2px',
                        color: isDarkMode ? 'white' : 'black'
                    }}
                >
                    Display Settings
                </div>

                <button
                    onClick={toggleTheme}
                    style={{
                        backgroundColor: isDarkMode ? '#444' : '#ccc',
                        color: isDarkMode ? 'white' : 'black',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </button>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '14px',
                        color: isDarkMode ? 'white' : 'black',
                        marginTop: '2px'
                    }}
                >
                    <label htmlFor="fontSizeSlider">Font Size:</label>
                    <input
                        type="range"
                        id="fontSizeSlider"
                        min="10"
                        max="30"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        style={{width: '80px'}}
                    />
                    <span>{fontSize}px</span>
                    <button onClick={handleToggle} className="theme-toggle-button">
                        {showLineNumbers ? 'Hide Line Numbers' : 'Show Line Numbers'}
                    </button>
                </div>
            </div>


            {pdfOpen && <PDFViewer chapters={chapters} initialPage={1} onClose={() => setPdfOpen(false)}/>}
        </header>
    );
}

export default Header;
