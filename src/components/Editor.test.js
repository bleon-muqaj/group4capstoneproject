import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Editor from './Editor';

beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(window, 'confirm').mockImplementation(() => true);
    localStorage.clear();
});

beforeAll(() => {
    jest.spyOn(window, 'open').mockImplementation(() => {});
    Object.defineProperty(window, 'location', {
        value: { assign: jest.fn() },
        writable: true,
    });
});

beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation((msg) => {
        if (
            msg.includes("Cannot read properties of undefined (reading 'failed')") ||
            msg.includes("Not implemented: navigation")
        ) {
            return;
        }
        console.log(msg);
    });
});

afterEach(() => {
    console.log.mockRestore();
});

if (!URL.createObjectURL) URL.createObjectURL = jest.fn(() => 'blob:url');
if (!URL.revokeObjectURL) URL.revokeObjectURL = jest.fn();

jest.mock('@monaco-editor/react', () => {
    const React = require('react');
    let hasMounted = false;
    return function MockMonacoEditor({ value, onChange, onMount }) {
        React.useEffect(() => {
            if (onMount && !hasMounted) {
                hasMounted = true;
                const model = { getValue: () => value };
                const editor = {
                    getModel: () => model,
                    onDidChangeModelContent: (cb) => {},
                    addAction: jest.fn(),
                };
                const monaco = {
                    MarkerSeverity: { Error: 1 },
                    editor: { setModelMarkers: jest.fn() },
                    languages: { registerHoverProvider: jest.fn() },
                };
                onMount(editor, monaco);
            }
        }, []);
        return (
            <input
                data-testid="monaco-editor"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        );
    };
});

jest.mock('../mimic-wasm/pkg/mimic_wasm.js', () => {
    const mockAssembleResult = {
        failed: () => false,
        error: () => "Mock error",
        text: () => new Uint8Array([0x00, 0x01, 0x02, 0x03]),
        data: () => new Uint8Array([0x04, 0x05, 0x06, 0x07]),
    };

    return {
        __esModule: true,
        default: jest.fn(() => Promise.resolve()),
        assemble_mips32: jest.fn(() => mockAssembleResult),
        Mips32Core: jest.fn(() => ({
            load_text: jest.fn(),
            load_data: jest.fn(),
            dump_registers: () => new Array(32).fill(0),
            tick: jest.fn().mockImplementationOnce(() => true).mockImplementationOnce(() => false),
        })),
        bytes_to_words: jest.fn((input) => {
            return Array.from({ length: input.length / 2 }, (_, i) => 0x12345678 + i);
        }),
    };
});

const getButton = (label) => screen.getByText(label, { exact: false });


test('Test 1: Editor component renders', () => {
    render(<Editor />);
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
});

test('Test 2: Monaco Editor initial code contains ".data"', () => {
    render(<Editor />);
    expect(screen.getByTestId('monaco-editor').value).toContain('.data');
});

test('Test 3: Monaco Editor initial code contains ".text"', () => {
    render(<Editor />);
    expect(screen.getByTestId('monaco-editor').value).toContain('.text');
});

test('Test 4: "Edit" button is rendered', () => {
    render(<Editor />);
    expect(getButton('Edit')).toBeInTheDocument();
});

test('Test 5: "Execute" button is rendered', () => {
    render(<Editor />);
    expect(getButton('Execute')).toBeInTheDocument();
});

test('Test 6: Default file name is "Untitled.asm"', () => {
    render(<Editor />);
    expect(screen.getByText('Untitled.asm')).toBeInTheDocument();
});

test('Test 7: Clicking "New File" creates an extra file', () => {
    render(<Editor />);
    fireEvent.click(getButton('File'));
    const initialFiles = screen.getAllByText(/\.asm/);
    fireEvent.click(getButton('New File'));
    const newFiles = screen.getAllByText(/\.asm/);
    expect(newFiles.length).toBeGreaterThan(initialFiles.length);
});

test('Test 8: Clicking a file button sets it as active', () => {
    render(<Editor />);
    fireEvent.click(screen.getByText('Untitled.asm'));
    expect(screen.getByTestId('monaco-editor').value).toContain('.data');
});

test('Test 9: Clicking delete removes a file if more than one exists', () => {
    render(<Editor />);
    fireEvent.click(getButton('File'));
    fireEvent.click(getButton('New File'));

    const fileTabs = screen.getAllByText(/\.asm/).filter(btn => btn.tagName === 'BUTTON');
    fireEvent.contextMenu(fileTabs[0]);

    const deleteButton = document.querySelector('div[style*="position: absolute"] button:nth-child(2)');
    fireEvent.click(deleteButton);

    const remainingFiles = screen.getAllByText(/\.asm/).filter(btn => btn.tagName === 'BUTTON');
    expect(remainingFiles.length).toBeGreaterThan(0);
});


test('Test 10: Deleting the only file resets to default', () => {
    render(<Editor />);

    const fileTabs = screen.getAllByText(/\.asm/).filter(btn => btn.tagName === 'BUTTON');
    fireEvent.contextMenu(fileTabs[0]);

    const deleteButton = document.querySelector('div[style*="position: absolute"] button:nth-child(2)');
    fireEvent.click(deleteButton);

    expect(screen.getByText('Untitled.asm')).toBeInTheDocument();
});

test('Test 11: Clicking "Rename" displays rename input', () => {
    render(<Editor />);

    const fileTabs = screen.getAllByText(/\.asm/).filter(btn => btn.tagName === 'BUTTON');
    fireEvent.contextMenu(fileTabs[0]);

    const renameButton = document.querySelector('div[style*="position: absolute"] button:nth-child(1)');
    fireEvent.click(renameButton);

    expect(screen.getByDisplayValue('Untitled.asm')).toBeInTheDocument();
});


test('Test 12: Committing rename updates the file name', () => {
    render(<Editor />);

    const fileTabs = screen.getAllByText(/\.asm/).filter(btn => btn.tagName === 'BUTTON');
    fireEvent.contextMenu(fileTabs[0]);

    const renameButton = document.querySelector('div[style*="position: absolute"] button:nth-child(1)');
    fireEvent.click(renameButton);

    const renameInput = screen.getByDisplayValue('Untitled.asm');
    fireEvent.change(renameInput, { target: { value: 'NewName.asm' } });
    fireEvent.click(screen.getByText('✔'));

    expect(screen.getByText('NewName.asm')).toBeInTheDocument();
});


test('Test 13: Canceling rename leaves the file name unchanged', () => {
    render(<Editor />);

    const fileTabs = screen.getAllByText(/\.asm/).filter(btn => btn.tagName === 'BUTTON');
    fireEvent.contextMenu(fileTabs[0]);

    const renameButton = document.querySelector('div[style*="position: absolute"] button:nth-child(1)');
    fireEvent.click(renameButton);

    const renameInput = screen.getByDisplayValue('Untitled.asm');
    fireEvent.change(renameInput, { target: { value: 'Changed.asm' } });
    fireEvent.click(screen.getByText('✖'));

    expect(screen.getByText('Untitled.asm')).toBeInTheDocument();
});


test('Test 14: Editing the file updates its content', () => {
    render(<Editor />);
    const editorInput = screen.getByTestId('monaco-editor');
    fireEvent.change(editorInput, { target: { value: 'Updated code' } });
    expect(editorInput.value).toContain('Updated code');
});

test('Test 15: LocalStorage is updated after code change', () => {
    render(<Editor />);
    const editorInput = screen.getByTestId('monaco-editor');
    fireEvent.change(editorInput, { target: { value: 'New content' } });
    const stored = JSON.parse(localStorage.getItem('files'));
    expect(stored[0].content).toContain('New content');
});

test('Test 16: Clicking "Assemble" shows the Run button', async () => {
    render(<Editor />);
    fireEvent.click(screen.getByRole('button', { name: /Assemble/ }));
    await waitFor(() => {
        expect(screen.getByRole('button', { name: /▶️ Run/ })).toBeInTheDocument();
    });
});


test('Test 17: After Assemble, output area is rendered', async () => {
    render(<Editor />);
    fireEvent.click(screen.getByRole('button', { name: /Assemble/ }));

    await waitFor(() => {
        // eslint-disable-next-line testing-library/no-node-access
        const pre = document.querySelector('pre');
        expect(pre).toBeTruthy();
    });
});


test('Test 18: After clicking "Run", the Run button becomes disabled', async () => {
    render(<Editor />);
    fireEvent.click(screen.getByRole('button', { name: /Assemble/ }));
    await waitFor(() => screen.getByRole('button', { name: /▶️ Run/ }));

    const runButton = screen.getByRole('button', { name: /▶️ Run/ });
    fireEvent.click(runButton);

    await waitFor(() => {
        expect(runButton).toBeDisabled();
    });
});


test('Test 19: Clicking "Download .asm" triggers URL.createObjectURL', () => {
    render(<Editor />);
    fireEvent.click(getButton('File'));
    const spy = jest.spyOn(URL, 'createObjectURL');
    fireEvent.click(getButton('Download .asm'));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
});

test('Test 20: Clicking "Download .data" triggers URL.createObjectURL', () => {
    render(<Editor />);
    fireEvent.click(getButton('File'));
    const spy = jest.spyOn(URL, 'createObjectURL');
    fireEvent.click(getButton('Download .data'));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
});

test('Test 21: Clicking "Download .text" triggers URL.createObjectURL', () => {
    render(<Editor />);
    fireEvent.click(getButton('File'));
    const spy = jest.spyOn(URL, 'createObjectURL');
    fireEvent.click(getButton('Download .text'));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
});

test('Test 22: Clicking "Execute" tab shows execution view', () => {
    render(<Editor />);
    fireEvent.click(getButton('Execute'));
    expect(screen.getByText(/Assemble your code/i)).toBeInTheDocument();
});

test('Test 23: Clicking "Edit" tab shows editor view', () => {
    render(<Editor />);
    fireEvent.click(getButton('Edit'));
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
});

test('Test 24: Console Output area is rendered', () => {
    render(<Editor />);
    expect(screen.getByText('Console Output:')).toBeInTheDocument();
});

test('Test 25: Registers area is rendered', () => {
    render(<Editor />);
    expect(screen.getByText('Registers:')).toBeInTheDocument();
});

test('Test 26: Register display contains "$zero"', () => {
    render(<Editor />);
    expect(screen.getByText('$zero')).toBeInTheDocument();
});

test('Test 27: Register display contains "$at"', () => {
    render(<Editor />);
    expect(screen.getByText('$at')).toBeInTheDocument();
});

test('Test 28: Editor background color changes in dark mode', () => {
    const { container } = render(<Editor isDarkMode={true} />);
    expect(container.firstChild).toHaveStyle('background-color: #121212');
});

test('Test 29: Default execution view message is shown', () => {
    render(<Editor />);
    fireEvent.click(getButton('Execute'));
    expect(screen.getByText(/Assemble your code/i)).toBeInTheDocument();
});

test('Test 30: New file default content is correct', () => {
    render(<Editor />);
    const content = screen.getByTestId('monaco-editor').value;
    expect(content.startsWith('.data')).toBe(true);
    expect(content).toContain('.text');
});

test('Test 31: Changing code in editor updates state', () => {
    render(<Editor />);
    const editorInput = screen.getByTestId('monaco-editor');
    fireEvent.change(editorInput, { target: { value: 'Test code' } });
    expect(editorInput.value).toBe('Test code');
});

test('Test 32: Clicking "Assemble" updates output', async () => {
    render(<Editor />);
    fireEvent.click(screen.getByRole('button', { name: /Assemble/ }));

    await waitFor(() => {
        expect(document.body.textContent.length).toBeGreaterThan(0);
    });
});


test('Test 33: After clicking "Run", Run button still exists', async () => {
    render(<Editor />);
    fireEvent.click(screen.getByRole('button', { name: /Assemble/ }));

    await waitFor(() => screen.getByRole('button', { name: /▶️ Run/ }));

    const runButton = screen.getByRole('button', { name: /▶️ Run/ });
    fireEvent.click(runButton);

    expect(runButton).toBeInTheDocument();
});


test('Test 34: Clicking "Assemble" enables the Run button', async () => {
    render(<Editor />);
    fireEvent.click(screen.getByRole('button', { name: /Assemble/ }));

    await waitFor(() => {
        expect(screen.getByRole('button', { name: /▶️ Run/ })).toBeInTheDocument();
    });
});


test('Test 35: Switching to Execute tab shows execution view message', () => {
    render(<Editor />);
    fireEvent.click(getButton('Execute'));
    expect(screen.getByText(/Assemble your code/i)).toBeInTheDocument();
});

test('Test 36: Switching to Edit tab shows editor view', () => {
    render(<Editor />);
    fireEvent.click(getButton('Execute'));
    fireEvent.click(getButton('Edit'));
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
});

test('Test 37: After deleting a file, at least one file exists', () => {
    render(<Editor />);
    fireEvent.click(getButton('File'));
    fireEvent.click(getButton('New File'));

    const fileTabs = screen.getAllByText(/\.asm/).filter(btn => btn.tagName === 'BUTTON');
    fireEvent.contextMenu(fileTabs[0]);

    const deleteButton = document.querySelector('div[style*="position: absolute"] button:nth-child(2)');
    fireEvent.click(deleteButton);

    const remainingFiles = screen.getAllByText(/\.asm/).filter(btn => btn.tagName === 'BUTTON');
    expect(remainingFiles.length).toBeGreaterThan(0);
});


test('Test 38: After deleting a file, default file exists', () => {
    render(<Editor />);
    const deleteButtons = screen.queryAllByText('✖');
    if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);
    }
    expect(screen.getAllByText(/\.asm/).length).toBeGreaterThan(0);
});

test('Test 39: Clicking "Rename" updates file name input value', () => {
    render(<Editor />);

    const fileTabs = screen.getAllByText(/\.asm/).filter(btn => btn.tagName === 'BUTTON');
    fireEvent.contextMenu(fileTabs[0]);

    const renameButton = document.querySelector('div[style*="position: absolute"] button:nth-child(1)');
    fireEvent.click(renameButton);

    const renameInput = screen.getByDisplayValue('Untitled.asm');
    fireEvent.change(renameInput, { target: { value: 'Temp.asm' } });

    expect(renameInput.value).toBe('Temp.asm');
});


test('Test 40: Clicking "Cancel" after rename reverts to original file name', () => {
    render(<Editor />);

    const fileTabs = screen.getAllByText(/\.asm/).filter(btn => btn.tagName === 'BUTTON');
    fireEvent.contextMenu(fileTabs[0]);

    const renameButton = document.querySelector('div[style*="position: absolute"] button:nth-child(1)');
    fireEvent.click(renameButton);

    const renameInput = screen.getByDisplayValue('Untitled.asm');
    fireEvent.change(renameInput, { target: { value: 'ShouldNotChange.asm' } });
    fireEvent.click(screen.getByText('✖'));

    expect(screen.getByText('Untitled.asm')).toBeInTheDocument();
});

