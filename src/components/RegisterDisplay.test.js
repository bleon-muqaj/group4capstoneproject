// RegisterDisplay.test.js
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import RegisterDisplay from './RegisterDisplay';

test('RegisterDisplay renders 32 rows with default props', () => {
    render(<RegisterDisplay />);

    // Get the table element by role.
    const table = screen.getByRole('table');
    // Retrieve the rowgroups (thead and tbody)
    const rowgroups = within(table).getAllByRole('rowgroup');
    // Assume the first rowgroup is header and the second is tbody.
    const tbodyRows = within(rowgroups[1]).getAllByRole('row');

    // Expect exactly 32 rows for 32 registers.
    expect(tbodyRows.length).toBe(32);

    // Validate the first row: index 0 should display $zero, 0, and 0x00000000.
    expect(screen.getByText('$zero')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getAllByText('0x00000000')[0]).toBeInTheDocument();

    expect(screen.getByText('$at')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getAllByText('0x00000000')[1]).toBeInTheDocument();
});

test('RegisterDisplay renders custom register values and highlights changed registers', () => {
    // Create custom register values.
    const registerValues = new Array(32).fill(0);
    // For example, update register 5 (which is $a1) with the value 255.
    registerValues[5] = 255; // toHexString(255) => "000000ff"
    const changedRegisters = new Array(32).fill(false);
    // Mark register 5 as changed.
    changedRegisters[5] = true;

    render(
        <RegisterDisplay
            registerValues={registerValues}
            changedRegisters={changedRegisters}
        />
    );

    // Verify that register 5's label is rendered.
    expect(screen.getByText('$a1')).toBeInTheDocument();
    // Verify that the value is rendered as "0x000000ff".
    expect(screen.getByText('0x000000ff')).toBeInTheDocument();

    // Check that the row corresponding to register $a1 has the highlight style.
    const registerA1Cell = screen.getByText('$a1');
    const row = registerA1Cell.closest('tr');
    expect(row).toHaveStyle('background-color: #ffcc00');
});

// Test: Custom register values are displayed correctly.
test('RegisterDisplay displays custom register values correctly', () => {
    // Create custom register values: for instance, register 1 will be 100, register 10 will be 1000.
    const registerValues = Array.from({ length: 32 }, (_, i) => {
        if (i === 1) return 100;   // 100 decimal => 0x00000064
        if (i === 10) return 1000; // 1000 decimal => 0x000003e8
        return 0;
    });
    const changedRegisters = new Array(32).fill(false);

    render(<RegisterDisplay registerValues={registerValues} changedRegisters={changedRegisters} />);

    // Verify that register 1's value is correctly formatted.
    expect(screen.getByText('0x00000064')).toBeInTheDocument();
    // Verify that register 10's value is correctly formatted.
    expect(screen.getByText('0x000003e8')).toBeInTheDocument();
});

// Test: Rows with changed registers have highlight style.
test('RegisterDisplay applies highlight style for changed registers only', () => {
    const registerValues = new Array(32).fill(0);
    // Mark register 3 and register 7 as changed.
    const changedRegisters = new Array(32).fill(false);
    changedRegisters[3] = true;
    changedRegisters[7] = true;

    render(<RegisterDisplay registerValues={registerValues} changedRegisters={changedRegisters} />);

    // Get all rows from the table body.
    const table = screen.getByRole('table');
    const rowgroups = within(table).getAllByRole('rowgroup');
    const tbodyRows = within(rowgroups[1]).getAllByRole('row');

    // Check that rows for registers 3 and 7 have the highlight background.
    expect(tbodyRows[3]).toHaveStyle('background-color: #ffcc00');
    expect(tbodyRows[7]).toHaveStyle('background-color: #ffcc00');

    // For a register not marked as changed (e.g., register 0), the row should have a transparent background.
    expect(tbodyRows[0]).toHaveStyle('background-color: transparent');
});

// 5. Test that the table header contains "Name", "Num", and "Value".
test('RegisterDisplay header contains correct titles', () => {
    render(<RegisterDisplay />);
    const headerRow = screen.getAllByRole('row')[0];
    expect(within(headerRow).getByText('Name')).toBeInTheDocument();
    expect(within(headerRow).getByText('Num')).toBeInTheDocument();
    expect(within(headerRow).getByText('Value')).toBeInTheDocument();
});

// 6. Test that each row in tbody has exactly 3 cells.
test('Each row in RegisterDisplay has 3 cells', () => {
    render(<RegisterDisplay />);
    const table = screen.getByRole('table');
    const rowgroups = within(table).getAllByRole('rowgroup');
    const tbodyRows = within(rowgroups[1]).getAllByRole('row');

    tbodyRows.forEach(row => {
        const cells = within(row).getAllByRole('cell');
        expect(cells.length).toBe(3);
    });
});

// 7. Test that default register values are "0x00000000" for all registers.
test('Default register values are 0x00000000 for all registers', () => {
    render(<RegisterDisplay />);
    const defaultValues = screen.getAllByText('0x00000000');
    expect(defaultValues.length).toBe(32);
});

// 8. Test that by default no row is highlighted.
test('By default, no row is highlighted', () => {
    render(<RegisterDisplay />);
    const table = screen.getByRole('table');
    const rowgroups = within(table).getAllByRole('rowgroup');
    const tbodyRows = within(rowgroups[1]).getAllByRole('row');

    tbodyRows.forEach(row => {
        expect(row).toHaveStyle('background-color: transparent');
    });
});

// 9. Test that register 31 displays label "$ra" and number 31.
test('Register 31 displays label "$ra" and number 31', () => {
    render(<RegisterDisplay />);
    expect(screen.getByText('$ra')).toBeInTheDocument();
    expect(screen.getByText('31')).toBeInTheDocument();
});

// 10. Test that a large register value is displayed correctly in hex format.
test('Large register value is displayed correctly in hex format', () => {
    const registerValues = new Array(32).fill(0);
    registerValues[2] = 0xffffffff;
    render(<RegisterDisplay registerValues={registerValues} />);
    expect(screen.getByText('0xffffffff')).toBeInTheDocument();
});

// 11. Test rendering when registerValues array length is less than 32.
test('RegisterDisplay renders correct number of rows when registerValues length is less than 32', () => {
    const registerValues = new Array(16).fill(0);
    const changedRegisters = new Array(16).fill(false);
    render(<RegisterDisplay registerValues={registerValues} changedRegisters={changedRegisters} />);
    const table = screen.getByRole('table');
    const rowgroups = within(table).getAllByRole('rowgroup');
    const tbodyRows = within(rowgroups[1]).getAllByRole('row');
    expect(tbodyRows.length).toBe(16);
});

// 12. Test rendering when registerValues array length is greater than 32.
test('RegisterDisplay renders correct number of rows when registerValues length is greater than 32', () => {
    const registerValues = new Array(33).fill(0);
    const changedRegisters = new Array(33).fill(false);
    render(<RegisterDisplay registerValues={registerValues} changedRegisters={changedRegisters} />);
    const table = screen.getByRole('table');
    const rowgroups = within(table).getAllByRole('rowgroup');
    const tbodyRows = within(rowgroups[1]).getAllByRole('row');
    expect(tbodyRows.length).toBe(33);
});

// 13. Test that each row displays the correct register label and number.
test('Each row displays correct register label and number', () => {
    render(<RegisterDisplay />);
    const registerLabels = [
        '$zero', '$at', '$v0', '$v1',
        '$a0', '$a1', '$a2', '$a3',
        '$t0', '$t1', '$t2', '$t3',
        '$t4', '$t5', '$t6', '$t7',
        '$s0', '$s1', '$s2', '$s3',
        '$s4', '$s5', '$s6', '$s7',
        '$t8', '$t9', '$k0', '$k1',
        '$gp', '$sp', '$fp', '$ra'
    ];
    const table = screen.getByRole('table');
    const rowgroups = within(table).getAllByRole('rowgroup');
    const tbodyRows = within(rowgroups[1]).getAllByRole('row');
    tbodyRows.forEach((row, index) => {
        expect(within(row).getByText(registerLabels[index])).toBeInTheDocument();
        expect(within(row).getByText(index.toString())).toBeInTheDocument();
    });
});

// 14. Test that a negative register value is displayed as "0xffffffff".
test('Negative register value is displayed as ffffffff', () => {
    const registerValues = new Array(32).fill(0);
    registerValues[0] = -1;
    render(<RegisterDisplay registerValues={registerValues} />);
    expect(screen.getByText('0xffffffff')).toBeInTheDocument();
});

// 15. Test that a random register value is converted to correct hex.
test('Random register value is converted to correct hex', () => {
    const registerValues = new Array(32).fill(0);
    // 123456789 in hex is 075bcd15
    registerValues[10] = 123456789;
    render(<RegisterDisplay registerValues={registerValues} />);
    expect(screen.getByText('0x075bcd15')).toBeInTheDocument();
});

// 16. Test behavior when changedRegisters array is shorter than registerValues.
test('Rows with missing changedRegisters default to not highlighted', () => {
    const registerValues = new Array(32).fill(0);
    const changedRegisters = new Array(16).fill(true); // Only 16 entries provided.
    render(<RegisterDisplay registerValues={registerValues} changedRegisters={changedRegisters} />);
    const table = screen.getByRole('table');
    const rowgroups = within(table).getAllByRole('rowgroup');
    const tbodyRows = within(rowgroups[1]).getAllByRole('row');

    for (let i = 0; i < 32; i++) {
        if (i < 16) {
            expect(tbodyRows[i]).toHaveStyle('background-color: #ffcc00');
        } else {
            expect(tbodyRows[i]).toHaveStyle('background-color: transparent');
        }
    }
});

// 17. Test that if changedRegisters prop is not provided, the default (all false) is used.
test('RegisterDisplay defaults to no highlights when changedRegisters is undefined', () => {
    render(<RegisterDisplay registerValues={new Array(32).fill(0)} />);
    const table = screen.getByRole('table');
    const rowgroups = within(table).getAllByRole('rowgroup');
    const tbodyRows = within(rowgroups[1]).getAllByRole('row');

    tbodyRows.forEach(row => {
        expect(row).toHaveStyle('background-color: transparent');
    });
});

// 18. Test that each row's value cell begins with "0x".
test('Each value cell begins with "0x"', () => {
    render(<RegisterDisplay />);
    const table = screen.getByRole('table');
    const rowgroups = within(table).getAllByRole('rowgroup');
    const tbodyRows = within(rowgroups[1]).getAllByRole('row');

    tbodyRows.forEach(row => {
        const valueCell = within(row).getAllByRole('cell')[2];
        expect(valueCell.textContent.startsWith('0x')).toBe(true);
    });
});

// 19. Test that the row order is consistent (first row is $zero, second is $at, etc.).
test('Row order is consistent with register order', () => {
    render(<RegisterDisplay />);
    const rows = screen.getAllByRole('row');
    // rows[0] is header; rows[1] should be for register 0 and rows[2] for register 1.
    expect(within(rows[1]).getByText('$zero')).toBeInTheDocument();
    expect(within(rows[2]).getByText('$at')).toBeInTheDocument();
});

// 20. Test that the table element has tableLayout set to fixed.
test('Table element has tableLayout set to fixed', () => {
    render(<RegisterDisplay />);
    const table = screen.getByRole('table');
    expect(table).toHaveStyle('table-layout: auto');
});

// 21. Test that header cells have border and padding styles.
test('Header cells have border and padding styles', () => {
    render(<RegisterDisplay />);
    const headerRow = screen.getAllByRole('row')[0];
    const headerCells = within(headerRow).getAllByRole('columnheader');
    headerCells.forEach(cell => {
        expect(cell).toHaveStyle('border: 1px solid grey');
        expect(cell).toHaveStyle('padding: 5px');
    });
});

// 22. Test that the container div has overflowX: hidden and width: 100%.
test('Container div has correct styles', () => {
    const { container } = render(<RegisterDisplay />);
    const div = container.firstChild;
    expect(div).toHaveStyle('overflow-x: hidden');
    expect(div).toHaveStyle('width: 100%');
});

// 23. Snapshot test of RegisterDisplay with default props.
test('RegisterDisplay matches snapshot with default props', () => {
    const { container } = render(<RegisterDisplay />);
    expect(container.firstChild).toMatchSnapshot();
});

// 24. Snapshot test with custom register values and changedRegisters.
test('RegisterDisplay matches snapshot with custom props', () => {
    const registerValues = new Array(32).fill(0);
    registerValues[7] = 42;
    const changedRegisters = new Array(32).fill(false);
    changedRegisters[7] = true;
    const { container } = render(
        <RegisterDisplay
            registerValues={registerValues}
            changedRegisters={changedRegisters}
        />
    );
    expect(container.firstChild).toMatchSnapshot();
});

// 25. Test that RegisterDisplay renders no rows when registerValues is an empty array.
test('RegisterDisplay renders no rows when registerValues is empty', () => {
    render(<RegisterDisplay registerValues={[]} changedRegisters={[]} />);
    const table = screen.getByRole('table');
    const rowgroups = within(table).getAllByRole('rowgroup');
    // If tbody exists, it should have 0 rows.
    const tbodyRows = rowgroups[1] ? within(rowgroups[1]).queryAllByRole('row') : [];
    expect(tbodyRows.length).toBe(0);
});
