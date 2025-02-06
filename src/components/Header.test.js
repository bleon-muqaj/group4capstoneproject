import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from './Header';

test('renders header with title', () => {
    render(<Header />);
    const headerElement = screen.getByText(/MIPS Simulator/i);
    expect(headerElement).toBeInTheDocument();
});
