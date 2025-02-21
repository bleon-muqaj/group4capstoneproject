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
