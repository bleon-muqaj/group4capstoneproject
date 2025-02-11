import React from 'react';
import PDFViewer from "./PDFViewer";
import './Header.css';

function Header() {
    return (
        <header className="header">
            <div className="header-title">MIPS Simulator</div>
            <PDFViewer/>
        </header>
    );
}

export default Header;
