import React, { useState } from 'react';
import PDFViewer from "./PDFViewer";

function Header({ toggleTheme, isDarkMode }) {
    const [pdfOpen, setPdfOpen] = useState(false);
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
        <header className="header">
            <div className="header-title">MIPS Simulator</div>
            <button onClick={() => setPdfOpen(true)} className="open-manual-button">
                View Manual
            </button>
            <button onClick={toggleTheme} className="theme-toggle-button">
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            {pdfOpen && <PDFViewer chapters={chapters} initialPage={1} onClose={() => setPdfOpen(false)} />}
        </header>
    );
}

export default Header;
