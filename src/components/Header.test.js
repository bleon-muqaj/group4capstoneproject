import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header';

jest.mock('./PDFViewer', () => {
    return function DummyPDFViewer(props) {
        return (
            <div data-testid="pdf-viewer">
                PDF Viewer - initialPage: {props.initialPage}
                {props.chapters && props.chapters.map(chap => (
                    <div key={chap.page}>{chap.title}</div>
                ))}
            </div>
        );
    };
});

// Default props for tests
const defaultProps = {
    toggleTheme: jest.fn(),
    isDarkMode: false,
    fontSize: 14,
    setFontSize: jest.fn(),
    onToggleLineNumbers: jest.fn(),
    isPdfOpen: false,
    setIsPdfOpen: jest.fn(),
    lastViewedPage: 1
};

test('renders header with title', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText(/MIPS Simulator/i)).toBeInTheDocument();
});

test('renders View Manual button with proper class', () => {
    render(<Header {...defaultProps} />);
    const viewButton = screen.getByText('View Manual');
    expect(viewButton).toBeInTheDocument();
    expect(viewButton).toHaveClass('open-manual-button');
});

test('does not render PDFViewer initially', () => {
    render(<Header {...defaultProps} />);
    expect(screen.queryByTestId('pdf-viewer')).toBeNull();
});

test('renders PDFViewer when isPdfOpen is true', () => {
    render(<Header {...defaultProps} isPdfOpen={true} />);
    expect(screen.getByTestId('pdf-viewer')).toBeInTheDocument();
});

test('PDFViewer displays initialPage and chapter titles', () => {
    render(<Header {...defaultProps} isPdfOpen={true} />);

    const viewer = screen.getByTestId('pdf-viewer');

    expect(viewer).toHaveTextContent('initialPage: 1');
    expect(viewer).toHaveTextContent('Table of Contents');
    expect(viewer).toHaveTextContent('Instructions');
    expect(viewer).toHaveTextContent('add');
});

test('header remains intact regardless of PDFViewer state', () => {
    render(<Header {...defaultProps} isPdfOpen={true} />);
    expect(screen.getByText(/MIPS Simulator/i)).toBeInTheDocument();
    expect(screen.getByText('View Manual')).toBeInTheDocument();
});
