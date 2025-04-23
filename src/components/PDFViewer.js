import React, { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "./PDFViewer.css";

pdfjs.GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js";

function PDFViewer({ initialPage = 1, chapters = [], isDarkMode = false }) {
    const [pageNumber, setPageNumber] = useState(initialPage);
    const [numPages, setNumPages] = useState(null);
    const [inputPage, setInputPage] = useState(initialPage);
    const [showSidebar, setShowSidebar] = useState(true);
    const [scale, setScale] = useState(1);
    const [pdfWidth, setPdfWidth] = useState(600);
    const containerRef = useRef(null);

    useEffect(() => {
        const updateSize = () => {
            if (!containerRef.current) return;
            const total = containerRef.current.offsetWidth;
            const sidebar = showSidebar ? 200 : 0;
            setPdfWidth(Math.max(300, total - sidebar - 20));
        };
        updateSize();
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, [showSidebar]);

    const onLoadSuccess = ({ numPages }) => setNumPages(numPages);
    const prevPage = () => setPageNumber((p) => Math.max(1, p - 1));
    const nextPage = () => setPageNumber((p) => (numPages ? Math.min(numPages, p + 1) : p));
    const goToPage = () => {
        let p = parseInt(inputPage, 10) || 1;
        if (numPages) p = Math.min(Math.max(1, p), numPages);
        setPageNumber(p);
        setInputPage(p);
    };
    const zoomIn = () => setScale((s) => Math.min(s + 0.1, 3));
    const zoomOut = () => setScale((s) => Math.max(s - 0.1, 0.5));

    return (
        <div
            className="popup-with-the-side"
            ref={containerRef}
            style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}
        >
            {showSidebar && (
                <div
                    className="side"
                    style={{
                        minWidth: 200,
                        overflowY: "auto",
                        backgroundColor: isDarkMode ? "#2a2a2a" : "#f0f0f0",
                        color: isDarkMode ? "white" : "black"
                    }}
                >
                    <h3>Chapters</h3>
                    <ul>
                        {chapters.map((c, i) => (
                            <li key={i}>
                                <button
                                    onClick={() => {
                                        setPageNumber(c.page);
                                        setInputPage(c.page);
                                    }}
                                >
                                    {c.title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="main" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <button onClick={() => setShowSidebar((v) => !v)} style={{ margin: 10 }}>
                    {showSidebar ? "Hide 📑 Contents" : "Show 📑 Contents"}
                </button>
                <div className="pdf-box" style={{ overflow: "auto", height: "100%", width: "100%" }}>
                    <div style={{ width: pdfWidth * scale }}>
                        <Document file="/manual.pdf" onLoadSuccess={onLoadSuccess}>
                            <Page pageNumber={pageNumber} width={pdfWidth * scale} />
                        </Document>
                    </div>
                </div>
                <div
                    className="pdf-control"
                    style={{
                        padding: 10,
                        backgroundColor: "#2a2a2a",
                        color: "white",
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                        justifyContent: "center"
                    }}
                >
                    <button onClick={prevPage}>⬅ Prev</button>
                    <span>
            Page {pageNumber} of {numPages}
          </span>
                    <button onClick={nextPage}>Next ➡</button>
                    <div className="page-input">
                        <input
                            type="number"
                            value={inputPage}
                            onChange={(e) => setInputPage(e.target.value)}
                            min="1"
                            style={{ width: 60 }}
                        />
                        <button onClick={goToPage}>Go</button>
                    </div>
                    <button onClick={zoomOut}>➖ Zoom Out</button>
                    <button onClick={zoomIn}>➕ Zoom In</button>
                    <span>{Math.round(scale * 100)}%</span>
                </div>
            </div>
        </div>
    );
}

export default PDFViewer;
