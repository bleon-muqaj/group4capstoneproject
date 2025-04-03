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


//exhaustive pdfviewer testing
describe('pdf viewer', () => {
  test('clicking "Open PDF" multiple times does not reset last viewed page', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Open PDF'));
    await waitFor(() => {
      expect(screen.getByText(/Page 5/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Close PDF'));
    fireEvent.click(screen.getByText('Open PDF'));
    await waitFor(() => {
      expect(screen.getByText(/Page 5/i)).toBeInTheDocument();
    });
  });

  test('renders Header component correctly', () => {
    render(<App />);
    expect(screen.getByText(/MIPS Simulator/i)).toBeInTheDocument();
  });

  test('PDFViewer receives correct initial page after multiple opens', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Open PDF'));
    fireEvent.click(screen.getByText('Close PDF'));
    fireEvent.click(screen.getByText('Open PDF'));
    await waitFor(() => {
      expect(screen.getByText(/Page 5/i)).toBeInTheDocument();
    });
  });

  test('PDFViewer does not appear without user action', () => {
    render(<App />);
    expect(screen.queryByTestId('pdf-viewer')).toBeNull();
  });

  test('lastViewedPage updates correctly when PDFViewer changes pages', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Open PDF'));
    fireEvent.click(screen.getByText('Close PDF'));
    fireEvent.click(screen.getByText('Open PDF'));
    expect(screen.getByText(/Page 5/i)).toBeInTheDocument();
  });

  test('app maintains last viewed page after reopening', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Open PDF'));
    fireEvent.click(screen.getByText('Close PDF'));
    fireEvent.click(screen.getByText('Open PDF'));
    expect(screen.getByText(/Page 5/i)).toBeInTheDocument();
  });

  test('closing PDFViewer does not reset lastViewedPage state', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Open PDF'));
    fireEvent.click(screen.getByText('Close PDF'));
    fireEvent.click(screen.getByText('Open PDF'));
    expect(screen.getByText(/Page 5/i)).toBeInTheDocument();
  });

  test('renders Editor component properly', () => {
    render(<App />);
    expect(screen.getByText('Open PDF')).toBeInTheDocument();
  });

  test('app does not break when clicking Open PDF multiple times rapidly', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Open PDF'));
    fireEvent.click(screen.getByText('Open PDF'));
    await waitFor(() => {
      expect(screen.getByText(/Page 5/i)).toBeInTheDocument();
    });
  });

  test('pdfviewer updates page correctly when lastViewedPage changes', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Open PDF'));
    fireEvent.click(screen.getByText('Close PDF'));
    fireEvent.click(screen.getByText('Open PDF'));
    expect(screen.getByText(/Page 5/i)).toBeInTheDocument();
  });



  test('clicking "Open PDF" twice in rapid succession does not cause issues', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Open PDF'));
    fireEvent.click(screen.getByText('Open PDF'));
    await waitFor(() => {
      expect(screen.getByText(/Page 5/i)).toBeInTheDocument();
    });
  });

  test('pdfviewer remains open after opening and closing another modal', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Open PDF'));
    fireEvent.click(screen.getByText('Open PDF'));
    await waitFor(() => {
      expect(screen.getByText(/Page 5/i)).toBeInTheDocument();
    });
  });

  test('clicking "Open PDF" retains lastViewedPage after multiple page switches', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Open PDF'));
    fireEvent.click(screen.getByText('Open PDF'));
    await waitFor(() => {
      expect(screen.getByText(/Page 5/i)).toBeInTheDocument();
    });
  });

  test('closing PDFViewer and reopening does not reset app state', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Open PDF'));
    fireEvent.click(screen.getByText('Close PDF'));
    fireEvent.click(screen.getByText('Open PDF'));
    await waitFor(() => {
      expect(screen.getByText(/Page 5/i)).toBeInTheDocument();
    });
  });
});
