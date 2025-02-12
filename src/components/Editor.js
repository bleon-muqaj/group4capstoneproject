import React, { useState } from 'react';
import MonacoEditor from '@monaco-editor/react';

function Editor() {
    const [code] = useState( '.data\n' + '\n' + '.text\n');

    return (
        <div style={{ height: '100%' }}>
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

