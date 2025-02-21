import React, { useState } from 'react';
import PDFViewer from "./PDFViewer";
import './Header.css';

function Header() {
    const [pdfOpen, setPdfOpen] = useState(false);
    const chapters = [
        { title: "Introduction", page: 1 },
        { title: "Setup", page: 5 },
        { title: "Instructions", page: 10 },
        { title: "Advanced Topics", page: 15 },
    ];

    return (
        <header className="header">
            <div className="header-title">MIPS Simulator</div>
            <button onClick={() => setPdfOpen(true)} className="open-manual-button">
                View Manual
            </button>
            {pdfOpen && <PDFViewer chapters={chapters} initialPage={1} onClose={() => setPdfOpen(false)} />}
        </header>
    );
}

export default Header;
