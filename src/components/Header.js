import React, { useState } from 'react';
import PDFViewer from "./PDFViewer";

function Header({ toggleTheme, isDarkMode }) {
    const [pdfOpen, setPdfOpen] = useState(false);
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
