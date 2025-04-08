import React from 'react';
import PDFViewer from "./PDFViewer";

function Header({ toggleTheme, isDarkMode, fontSize, setFontSize }) {
    const [pdfOpen, setPdfOpen] = React.useState(false);

    const chapters = [
        { title: "Table of Contents", page: 1 },
        { title: "Instructions", page: 3 },
        { title: "addi", page: 45 },
        { title: "addiu", page: 46 },
        { title: "addu", page: 48 },
        { title: "andi", page: 55 },
        { title: "beq", page: 82 },
        { title: "bne", page: 113 },
        { title: "j", page: 204 },
        { title: "or", page: 324 },
        { title: "ori", page: 325 },
        { title: "sll", page: 386 },
        { title: "slt", page: 388 },
        { title: "syscall", page: 425 },
        { title: "xor", page: 456 },
    ];

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
                </div>
            </div>


            {pdfOpen && <PDFViewer chapters={chapters} initialPage={1} onClose={() => setPdfOpen(false)}/>}
        </header>
    );
}

export default Header;
