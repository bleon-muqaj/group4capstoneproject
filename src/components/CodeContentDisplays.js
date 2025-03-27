import React from 'react';

function toHexString(number) {
    const hexString = (number >>> 0).toString(16);
    return hexString.padStart(8, '0');
}

export function TextSegmentDisplay({textDump}) {
    const textValues = textDump.slice(0, -1).split('\n');
    const baseAddress = 4194304;

    return (
        <div style={{overflowX: 'hidden', width: '100%'}}>
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                border: '2px solid grey',
                tableLayout: 'fixed'
            }}>
                <thead>
                <tr>
                    <th style={{width: '30%', border: '1px solid grey', padding: '5px'}}>Address</th>
                    <th style={{width: '15%', border: '1px solid grey', padding: '5px'}}>Code</th>
                </tr>
                </thead>
                <tbody>
                {textValues.map((value, index) =>
                    <tr key={index} style={{backgroundColor: 'transparent'}}>
                        <td style={{
                            border: '1px solid grey',
                            padding: '5px',
                            textAlign: 'center',
                            fontWeight: 'bold'
                        }}>0x{toHexString(baseAddress + index * 4)}</td>
                        <td style={{border: '1px solid grey', padding: '5px', textAlign: 'center'}}>0x{value}</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}

export function DataSegmentDisplay({dataDump}) {
    const initialDataValues = dataDump.slice(0, -1).split('\n');
    // Create an array containing the data values and fill the rest with the default value (00000000)
    const filledDataValues = [...initialDataValues, ...Array(15 * 9 - initialDataValues.length).fill('00000000')];
    const tableValues = Array.from({length: 15}, (_, rowIndex) =>
        filledDataValues.slice(rowIndex * 9, (rowIndex + 1) * 9)
    );
    const baseAddress = 268500992;

    return (
        <div style={{overflowX: 'hidden', width: '100%'}}>
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                border: '2px solid grey',
                tableLayout: 'fixed'
            }}>
                <thead>
                <tr>
                    <th style={{width: '15%', border: '1px solid grey', padding: '5px'}}>Address</th>
                    <th style={{width: '15%', border: '1px solid grey', padding: '5px'}}>Value (+0)</th>
                    <th style={{width: '15%', border: '1px solid grey', padding: '5px'}}>Value (+4)</th>
                    <th style={{width: '15%', border: '1px solid grey', padding: '5px'}}>Value (+8)</th>
                    <th style={{width: '15%', border: '1px solid grey', padding: '5px'}}>Value (+c)</th>
                    <th style={{width: '15%', border: '1px solid grey', padding: '5px'}}>Value (+10)</th>
                    <th style={{width: '15%', border: '1px solid grey', padding: '5px'}}>Value (+14)</th>
                    <th style={{width: '15%', border: '1px solid grey', padding: '5px'}}>Value (+18)</th>
                    <th style={{width: '15%', border: '1px solid grey', padding: '5px'}}>Value (+1c)</th>
                </tr>
                </thead>
                <tbody>
                {tableValues.map((row, rowIndex) => (
                    <tr key={rowIndex} style={{backgroundColor: 'transparent'}}>
                        <td style={{
                            border: '1px solid grey',
                            padding: '5px',
                            textAlign: 'center',
                            fontWeight: 'bold'
                        }}>
                            0x{toHexString(baseAddress + rowIndex * 32)}
                        </td>
                        {row.map((value, colIndex) => (
                            <td key={colIndex} style={{
                                border: '1px solid grey',
                                padding: '5px',
                                textAlign: 'center'
                            }}>
                                0x{value}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}