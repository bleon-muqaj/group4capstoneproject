import React, { useState } from 'react';
import Header from './components/Header';
import Editor from './components/Editor';
import PDFViewer from './components/PDFViewer';
import './App.css';

function App() {
    const [isPdfOpen, setIsPdfOpen] = useState(false);
    const [lastViewedPage, setLastViewedPage] = useState(1);

    return (
        <div className="App">
            <Header />
            <div className="main-content">
                <Editor onPdfOpen={(page) => {
                    setLastViewedPage(page || lastViewedPage);
                    setIsPdfOpen(true);
                }} />
            </div>

            {isPdfOpen && (
                <PDFViewer
                    onClose={() => setIsPdfOpen(false)}
                    initialPage={lastViewedPage}
                    onPageChange={setLastViewedPage}
                />
            )}
        </div>
    );
}

export default App;
