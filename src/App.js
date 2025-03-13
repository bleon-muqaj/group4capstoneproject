import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Editor from './components/Editor';
import './App.css';

function App() {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem("theme") === "light" ? false : true;
    });

    useEffect(() => {
        localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    return (
        <div className={`App ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
            <Header toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
            <Editor isDarkMode={isDarkMode} />
        </div>
    );
}

export default App;
