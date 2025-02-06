import React from 'react';
import Header from './components/Header';
import Editor from './components/Editor';
import './App.css';

function App() {
    return (
        <div className="App">
            <Header />
            <div className="main-content">
                <div className="editor-container">
                    <Editor />
                </div>
                <div className="right-panel">
                    {/* here should be like register stuff */}
                    <p>Right side</p>
                </div>
            </div>
        </div>
    );
}

export default App;
