import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('@monaco-editor/react', () => {
  return function DummyMonacoEditor(props) {
    return <div data-testid="monaco-editor">{props.value}</div>;
  };
});

test('for rendering app with header, editor and right panel', () => {
  render(<App />);
  const headerElement = screen.getByText(/MIPS Simulator/i);
  expect(headerElement).toBeInTheDocument();

  const editorElement = screen.getByTestId('monaco-editor');
  expect(editorElement).toBeInTheDocument();

  const rightPanelElement = screen.getByText(/Right side/i);
  expect(rightPanelElement).toBeInTheDocument();
});
