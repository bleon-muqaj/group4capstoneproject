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
                <button onClick={props.onClose}>Close</button>
            </div>
        );
    };
});

test('renders header with title', () => {
    render(<Header />);
    expect(screen.getByText(/MIPS Simulator/i)).toBeInTheDocument();
});

test('renders View Manual button with proper class', () => {
    render(<Header />);
    const viewButton = screen.getByText('View Manual');
    expect(viewButton).toBeInTheDocument();
    expect(viewButton).toHaveClass('open-manual-button');
});

test('does not render PDFViewer initially', () => {
    render(<Header />);
    expect(screen.queryByTestId('pdf-viewer')).toBeNull();
});

test('clicking View Manual button shows PDFViewer', () => {
    render(<Header />);
    fireEvent.click(screen.getByText('View Manual'));
    expect(screen.getByTestId('pdf-viewer')).toBeInTheDocument();
});

test('PDFViewer displays initialPage and chapter titles', () => {
    render(<Header />);

    fireEvent.click(screen.getByText('View Manual'));

    const viewer = screen.getByTestId('pdf-viewer');

    // Check for initialPage info
    expect(viewer).toHaveTextContent('initialPage: 1');

    // Check for some known chapters
    expect(viewer).toHaveTextContent('Table of Contents');
    expect(viewer).toHaveTextContent('Instructions');
    expect(viewer).toHaveTextContent('add');
});

test('clicking Close button inside PDFViewer hides PDFViewer', () => {
    render(<Header />);

    fireEvent.click(screen.getByText('View Manual'));

    // The Close button is actually "❌"
    const closeButton = screen.getByText('❌');
    fireEvent.click(closeButton);

    expect(screen.queryByTestId('pdf-viewer')).toBeNull();
});


test('header remains intact after closing PDFViewer', () => {
    render(<Header />);
    fireEvent.click(screen.getByText('View Manual'));
    fireEvent.click(screen.getByText('Close'));
    expect(screen.getByText(/MIPS Simulator/i)).toBeInTheDocument();
    expect(screen.getByText('View Manual')).toBeInTheDocument();
});

test('clicking View Manual button twice does not duplicate PDFViewer', () => {
    render(<Header />);
    const viewButton = screen.getByText('View Manual');
    fireEvent.click(viewButton);
    fireEvent.click(viewButton);
    const viewers = screen.getAllByTestId('pdf-viewer');
    expect(viewers.length).toBe(1);
});
