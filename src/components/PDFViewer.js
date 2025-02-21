import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import './PDFViewer.css';

pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js';

function PDFViewer({ onClose, initialPage = 1, chapters = [] }) {
    const [pageNumber, setPageNumber] = useState(initialPage);
    const [numPages, setNumPages] = useState(null);
    const [inputPage, setInputPage] = useState(initialPage);

    const onLoad = ({ numPages }) => setNumPages(numPages);
    const prevPage = () => setPageNumber(pageNumber > 1 ? pageNumber - 1 : 1);
    const nextPage = () => setPageNumber(numPages && pageNumber < numPages ? pageNumber + 1 : pageNumber);
    const goToPage = () => {
        let page = (parseInt(inputPage, 10) || 1) > numPages ? numPages : (parseInt(inputPage, 10) || 1);
        setPageNumber(page);
        setInputPage(page);
    };

    return (
        <div className="popup">
            <div className="popup-with-the-side">
                <button onClick={onClose} className="close-button">X</button>
                <div className="side">
                    <h3>Chapters</h3>
                    <ul>
                        {(() => {
                            let items = [];
                            let count = 0;
                            for (let i = 0; i < chapters.length; i++) {
                                items[count] =
                                    (<li>
                                        <button onClick={() => { setPageNumber(chapters[i].page); setInputPage(chapters[i].page); }}>{chapters[i].title}</button>
                                    </li>);
                                count++;
                            }
                            return items;
                        })()}
                    </ul>
                </div>
                <div className="main">
                    <div className="pdf-box">
                        <Document file="/manual.pdf" onLoadSuccess={onLoad}>
                            <Page pageNumber={pageNumber} width={800} />
                        </Document>
                    </div>
                    <div className="pdf-control">
                        <button onClick={prevPage}>Prev</button>
                        <span>Page {pageNumber} {`of ${numPages}`}</span>
                        <button onClick={nextPage}>Next</button>
                        <div className="page-input">
                            <input type="number" value={inputPage} onChange={(e) => setInputPage(e.target.value)} min="1" />
                            <button onClick={goToPage}>Go</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PDFViewer;
