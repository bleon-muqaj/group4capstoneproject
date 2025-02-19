import React, { useState, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';

function Editor() {
    const [code, setCode] = useState( '.data\n' + '\n' + '.text\n');
    // We use a ref to reference the hidden file input

    //added setCode to const ^

    //IMPORT FILE FUNCTIONALITY
    const fileInputRef = useRef(null);

    const handleImportClick = () => {
        // Programmatically click the hidden file input
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const fileContents = e.target.result;
            setCode(fileContents);
        };
        reader.readAsText(file);
    };



    return (
        <div style={{ height: '100%' }}>

            {/* Import Code button HTML */}
            <button onClick={handleImportClick}>
                Import Code
            </button>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".txt,.asm,.s,.mips"
                onChange={handleFileChange}
            />



            <MonacoEditor
                height="100%"
                width="100%"
                defaultLanguage="mips"
                value={code}
                theme="vs-dark"
                options={{
                    automaticLayout: true,
                }}
            />
        </div>
    );
}

export default Editor;

