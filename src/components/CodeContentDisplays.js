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
                            textAlign: 'center'
                        }}>{toHexString(baseAddress + index * 4)}</td>
                        <td style={{border: '1px solid grey', padding: '5px', textAlign: 'center'}}>{value}</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}

export function DataSegmentDisplay() {

}