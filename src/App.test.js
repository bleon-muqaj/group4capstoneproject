import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

jest.mock('./components/Editor', () => {
  return function DummyEditor(props) {
    return <button onClick={() => props.onPdfOpen(5)}>Open PDF</button>;
  };
});

jest.mock('./components/PDFViewer', () => {
  return function DummyPDFViewer(props) {
    return (
        <div data-testid="pdf-viewer">
          PDF Viewer - Page {props.initialPage}
          <button onClick={props.onClose}>Close PDF</button>
        </div>
    );
  };
});

describe('App Component', () => {
  test('renders header with title', () => {
    render(<App />);
    expect(screen.getByText(/MIPS Simulator/i)).toBeInTheDocument();
  });

  test('renders Editor with "Open PDF" button', () => {
    render(<App />);
    expect(screen.getByText('Open PDF')).toBeInTheDocument();
  });

  test('does not render PDFViewer initially', () => {
    render(<App />);
    expect(screen.queryByTestId('pdf-viewer')).toBeNull();
  });

  test('clicking "Open PDF" opens PDFViewer with page 5', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Open PDF'));
    await waitFor(() => {
      expect(screen.getByTestId('pdf-viewer')).toBeInTheDocument();
    });
    expect(screen.getByText(/Page 5/i)).toBeInTheDocument();
  });

  test('clicking "Close PDF" closes PDFViewer', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Open PDF'));
    await waitFor(() => {
      expect(screen.getByTestId('pdf-viewer')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Close PDF'));
    await waitFor(() => {
      expect(screen.queryByTestId('pdf-viewer')).toBeNull();
    });
  });
});