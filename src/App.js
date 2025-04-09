import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Editor from './components/Editor';
import PDFViewer from './components/PDFViewer';
import './App.css';

function App() {
    const [isPdfOpen, setIsPdfOpen] = useState(false);
    const [lastViewedPage, setLastViewedPage] = useState(1);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem("theme") === "light" ? false : true;
    });

    const [fontSize, setFontSize] = useState(14); // NEW

    useEffect(() => {
        localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    return (
        <div className={`App ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
            <Header
                toggleTheme={toggleTheme}
                isDarkMode={isDarkMode}
                fontSize={fontSize}              // NEW
                setFontSize={setFontSize}        // NEW
            />
            <Editor
                fontSize={fontSize}              // NEW
                onPdfOpen={(page) => {
                    setLastViewedPage(page || lastViewedPage);
                    setIsPdfOpen(true);
                }}
                isDarkMode={isDarkMode}
            />
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
