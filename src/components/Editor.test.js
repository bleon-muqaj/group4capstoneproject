import React from 'react';
import { render, screen } from '@testing-library/react';
import Editor from './Editor';

jest.mock('@monaco-editor/react', () => {
    return function DummyMonacoEditor(props) {
        return <div data-testid="monaco-editor">{props.value}</div>;
    };
});

test('renders MonacoEditor with initial code', () => {
    render(<Editor />);
    const editorElement = screen.getByTestId('monaco-editor');
    expect(editorElement).toBeInTheDocument();
    expect(editorElement).toHaveTextContent('.data');
    expect(editorElement).toHaveTextContent('.text');
});
