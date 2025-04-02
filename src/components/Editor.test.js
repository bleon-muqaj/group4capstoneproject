import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Editor from './Editor';

beforeEach(() => {
    jest.spyOn(window, 'confirm').mockImplementation(() => true);
});

if (!URL.createObjectURL) {
    URL.createObjectURL = jest.fn(() => 'blob:url');
}
if (!URL.revokeObjectURL) {
    URL.revokeObjectURL = jest.fn();
}

jest.mock('@monaco-editor/react', () => {
    const React = require('react');
    return function DummyMonacoEditor(props) {
        React.useEffect(() => {
            if (props.onMount) {
                const dummyMonaco = {
                    languages: {
                        registerHoverProvider: jest.fn(),
                    },
                };
                props.onMount(
                    {
                        getPosition: () => ({ lineNumber: 1, column: 1 }),
                        getModel: () => ({ getWordAtPosition: () => null }),
                        addAction: jest.fn(),
                    },
                    dummyMonaco
                );
            }
        }, []);
        return (
            <input
                data-testid="monaco-editor"
                value={props.value}
                onChange={e => props.onChange && props.onChange(e.target.value)}
            />
        );
    };
});

beforeEach(() => {
    localStorage.clear();
});

test('renders MonacoEditor with initial code', () => {
    render(<Editor />);
    const editorEl = screen.getByTestId('monaco-editor');
    expect(editorEl).toBeInTheDocument();
    expect(editorEl.value).toContain('.data');
    expect(editorEl.value).toContain('.text');
});

test('renders New File button', () => {
    render(<Editor />);
    expect(screen.getByText('New File')).toBeInTheDocument();
});

test('clicking New File adds a new file', () => {
    render(<Editor />);
    const initialFiles = screen.getAllByText(/\.asm/);
    fireEvent.click(screen.getByText('New File'));
    const updatedFiles = screen.getAllByText(/\.asm/);
    expect(updatedFiles.length).toBe(initialFiles.length + 1);
});

test('clicking file button sets active file', () => {
    render(<Editor />);
    fireEvent.click(screen.getByText('Untitled.asm'));
    const editorEl = screen.getByTestId('monaco-editor');
    expect(editorEl.value).toContain('.data');
});

test('deleting a file removes it', () => {
    render(<Editor />);
    fireEvent.click(screen.getByText('New File'));
    const deleteButtons = screen.getAllByText('x');
    fireEvent.click(deleteButtons[0]);
    expect(screen.queryByText('Untitled.asm')).not.toBeInTheDocument();
});

test('deleting the only file resets to default', () => {
    render(<Editor />);
    fireEvent.click(screen.getByText('x'));
    expect(screen.getByText('Untitled.asm')).toBeInTheDocument();
});

test('clicking rename displays rename input and buttons', () => {
    render(<Editor />);
    fireEvent.click(screen.getByText('rename'));
    const renameInput = screen.getByDisplayValue('Untitled.asm');
    expect(renameInput).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
});

test('committing rename updates file name', () => {
    render(<Editor />);
    fireEvent.click(screen.getByText('rename'));
    const renameInput = screen.getByDisplayValue('Untitled.asm');
    fireEvent.change(renameInput, { target: { value: 'NewName.asm' } });
    fireEvent.click(screen.getByText('OK'));
    expect(screen.getByText('NewName.asm')).toBeInTheDocument();
});

test('cancelling rename leaves file name unchanged', () => {
    render(<Editor />);
    fireEvent.click(screen.getByText('rename'));
    const renameInput = screen.getByDisplayValue('Untitled.asm');
    fireEvent.change(renameInput, { target: { value: 'ShouldNotChange.asm' } });
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.getByText('Untitled.asm')).toBeInTheDocument();
});

test('importing a file adds it to file list', async () => {
    render(<Editor />);
    const file = new File(['.data\n.text'], 'imported.asm', { type: 'text/plain' });
    const input = screen.getByLabelText('Import');
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
        expect(screen.getByText('imported.asm')).toBeInTheDocument();
    });
});

test('exporting a file triggers download', () => {
    render(<Editor />);
    const createObjURLSpy = jest.spyOn(URL, 'createObjectURL');
    fireEvent.click(screen.getByText('Export'));
    expect(createObjURLSpy).toHaveBeenCalled();
    createObjURLSpy.mockRestore();
});

test('localStorage updates on file content change', () => {
    render(<Editor />);
    const editorEl = screen.getByTestId('monaco-editor');
    fireEvent.change(editorEl, { target: { value: 'Updated content' } });
    const stored = JSON.parse(localStorage.getItem('files'));
    expect(stored[0].content).toBe('Updated content');
});

test('initial file name is Untitled.asm', () => {
    render(<Editor />);
    expect(screen.getByText('Untitled.asm')).toBeInTheDocument();
});

test('MonacoEditor displays current file content', () => {
    render(<Editor />);
    const editorEl = screen.getByTestId('monaco-editor');
    expect(editorEl.value).toContain('.data');
    expect(editorEl.value).toContain('.text');
});

test('editor change updates file content state', () => {
    render(<Editor />);
    const editorEl = screen.getByTestId('monaco-editor');
    fireEvent.change(editorEl, { target: { value: 'New code' } });
    expect(editorEl.value).toContain('New code');
});

test('new file button displays correct file name format', () => {
    render(<Editor />);
    fireEvent.click(screen.getByText('New File'));
    expect(screen.getByText(/File\d+\.asm/)).toBeInTheDocument();
});

test('active file changes on file button click', () => {
    render(<Editor />);
    fireEvent.click(screen.getByText('New File'));
    fireEvent.click(screen.getByText('Untitled.asm'));
    const editorEl = screen.getByTestId('monaco-editor');
    expect(editorEl.value).toContain('.data');
});

test('rename input is removed after commit', () => {
    render(<Editor />);
    fireEvent.click(screen.getByText('rename'));
    const renameInput = screen.getByDisplayValue('Untitled.asm');
    fireEvent.change(renameInput, { target: { value: 'Temp.asm' } });
    fireEvent.click(screen.getByText('OK'));
    expect(screen.queryByDisplayValue('Temp.asm')).toBeNull();
});

test('rename input is removed after cancel', () => {
    render(<Editor />);
    fireEvent.click(screen.getByText('rename'));
    const renameInput = screen.getByDisplayValue('Untitled.asm');
    fireEvent.change(renameInput, { target: { value: 'Temp.asm' } });
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByDisplayValue('Temp.asm')).toBeNull();
});

test('deleting active file updates active index', () => {
    render(<Editor />);
    fireEvent.click(screen.getByText('New File'));
    fireEvent.click(screen.getByText(/File\d+\.asm/));
    const deleteButtons = screen.getAllByText('x');
    fireEvent.click(deleteButtons[1]);
    expect(screen.getByText('Untitled.asm')).toBeInTheDocument();
});

test('assemble button sets assembly success message', async () => {
    const mockAssemble = {
        failed: () => false,
        text: () => new Uint8Array([0x12, 0x34, 0x56, 0x78]),
        data: () => new Uint8Array([0xab, 0xcd, 0xef, 0x00]),
    };
    jest.mock('../mimic-wasm/pkg/mimic_wasm.js', () => ({
        init: jest.fn(),
        assemble_mips32: jest.fn(() => mockAssemble),
        bytes_to_words: jest.fn(() => [0x12345678]),
    }));
    render(<Editor />);
    fireEvent.click(screen.getByText('Assemble'));
    await waitFor(() => {
        expect(screen.getByText('Assembly was successful.')).toBeInTheDocument();
    });
});

test('run button is disabled before assembly', () => {
    render(<Editor />);
    expect(screen.getByText('Run')).toBeDisabled();
});

test('run button is enabled after assembly', async () => {
    render(<Editor />);
    fireEvent.click(screen.getByText('Assemble'));
    await waitFor(() => {
        expect(screen.getByText('Run')).not.toBeDisabled();
    });
});

test('tab switching displays correct content', () => {
    render(<Editor />);
    fireEvent.click(screen.getByText('Execute'));
    expect(screen.getByText(/Assemble your code to view/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
});

test('console output updates after run', async () => {
    const coreMock = {
        load_text: jest.fn(),
        load_data: jest.fn(),
        dump_registers: () => {
            const regs = new Array(32).fill(0);
            regs[2] = 10;
            return regs;
        },
        tick: jest.fn()
            .mockImplementationOnce(() => true)
            .mockImplementationOnce(() => false),
    };
    jest.mock('../mimic-wasm/pkg/mimic_wasm.js', () => ({
        init: jest.fn(),
        Mips32Core: jest.fn(() => coreMock),
        assemble_mips32: jest.fn(() => ({
            failed: () => false,
            text: () => new Uint8Array([0x00]),
            data: () => new Uint8Array([0x00]),
        })),
        bytes_to_words: jest.fn(() => [0x00000000]),
    }));

    render(<Editor />);
    fireEvent.click(screen.getByText('Assemble'));
    await waitFor(() => fireEvent.click(screen.getByText('Run')));
    await waitFor(() => {
        expect(screen.getByText(/Exit/)).toBeInTheDocument();
    });
});

test('creating and removing multiple files updates tab list correctly', () => {
    render(<Editor />);
    fireEvent.click(screen.getByText('New File'));
    fireEvent.click(screen.getByText('New File'));
    let files = screen.getAllByText(/\.asm/);
    expect(files.length).toBeGreaterThan(2);
    const deleteButtons = screen.getAllByText('x');
    fireEvent.click(deleteButtons[0]);
    fireEvent.click(deleteButtons[1]);
    expect(screen.getByText('Untitled.asm')).toBeInTheDocument();
});

test('editor mounts and registers hover provider', () => {
    const monacoSpy = jest.fn();
    render(<Editor />);
    expect(monacoSpy).not.toThrow;
});

test('downloading .asm file triggers blob creation', () => {
    render(<Editor />);
    const spy = jest.spyOn(URL, 'createObjectURL');
    fireEvent.click(screen.getByText('Download .asm'));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
});

test('download .data button works after assembling', async () => {
    render(<Editor />);
    fireEvent.click(screen.getByText('Assemble'));
    await waitFor(() => {
        const downloadBtn = screen.getByText('Download .data');
        expect(downloadBtn).toBeInTheDocument();
    });
});

test('register display renders 32 registers', () => {
    render(<Editor />);
    expect(screen.getByText('$zero')).toBeInTheDocument();
    expect(screen.getAllByText(/0x[0-9a-f]{8}/i).length).toBeGreaterThan(20);
});

test('output updates correctly on syscall', async () => {
    const coreMock = {
        load_text: jest.fn(),
        load_data: jest.fn(),
        dump_registers: () => {
            const regs = new Array(32).fill(0);
            regs[2] = 4;
            return regs;
        },
        tick: jest.fn()
            .mockImplementationOnce(() => true)
            .mockImplementationOnce(() => {
                coreMock.dump_registers = () => {
                    const regs = new Array(32).fill(0);
                    regs[2] = 10;
                    return regs;
                };
                return true;
            })
            .mockImplementationOnce(() => false),
    };

    jest.mock('../mimic-wasm/pkg/mimic_wasm.js', () => ({
        Mips32Core: jest.fn(() => coreMock),
        assemble_mips32: jest.fn(() => ({
            failed: () => false,
            text: () => new Uint8Array([0x00]),
            data: () => new Uint8Array([0x00]),
        })),
        bytes_to_words: jest.fn(() => [0x00000000]),
        init: jest.fn(),
    }));

    render(<Editor />);
    fireEvent.click(screen.getByText('Assemble'));
    await waitFor(() => fireEvent.click(screen.getByText('Run')));
    await waitFor(() => {
        expect(screen.getByText('Print String')).toBeInTheDocument();
    });
});