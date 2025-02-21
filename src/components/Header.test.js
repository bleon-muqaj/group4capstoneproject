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
    expect(viewer).toHaveTextContent('PDF Viewer - initialPage: 1');
    expect(viewer).toHaveTextContent('Introduction');
    expect(viewer).toHaveTextContent('Setup');
    expect(viewer).toHaveTextContent('Instructions');
    expect(viewer).toHaveTextContent('Advanced Topics');
});

test('clicking Close button inside PDFViewer hides PDFViewer', () => {
    render(<Header />);
    fireEvent.click(screen.getByText('View Manual'));
    const closeButton = screen.getByText('Close');
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
