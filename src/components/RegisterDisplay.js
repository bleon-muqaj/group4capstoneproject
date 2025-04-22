import React from 'react';

function RegisterDisplay({registerValues = new Array(32).fill(0), changedRegisters = new Array(32).fill(false)}) {
    const registerLabels = {
        0: '$zero', 1: '$at', 2: '$v0', 3: '$v1',
        4: '$a0', 5: '$a1', 6: '$a2', 7: '$a3',
        8: '$t0', 9: '$t1', 10: '$t2', 11: '$t3',
        12: '$t4', 13: '$t5', 14: '$t6', 15: '$t7',
        16: '$s0', 17: '$s1', 18: '$s2', 19: '$s3',
        20: '$s4', 21: '$s5', 22: '$s6', 23: '$s7',
        24: '$t8', 25: '$t9', 26: '$k0', 27: '$k1',
        28: '$gp', 29: '$sp', 30: '$fp', 31: '$ra'
    };

    function toHexString(number) {
        const hexString = (number >>> 0).toString(16);
        return hexString.padStart(8, '0');
    }

    return (
        <div style={{overflowX: 'hidden', width: '100%'}}>
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                border: '2px solid grey',
                tableLayout: 'auto'
            }}>
                <thead>
                <tr>
                    <th style={{width: '30%', border: '1px solid grey', padding: '5px'}}>Name</th>
                    <th style={{width: '15%', border: '1px solid grey', padding: '5px'}}>Num</th>
                    <th style={{width: '55%', border: '1px solid grey', padding: '5px'}}>Value</th>
                </tr>
                </thead>
                <tbody>
                {[...registerValues].map((value, index) =>
                    <tr key={index} style={{backgroundColor: changedRegisters[index] ? '#ffcc00' : 'transparent'}}>
                        <td style={{
                            border: '1px solid grey',
                            padding: '5px',
                            textAlign: 'center'
                        }}>{registerLabels[index]}</td>
                        <td style={{border: '1px solid grey', padding: '5px', textAlign: 'center'}}>{index}</td>
                        <td style={{
                            border: '1px solid grey',
                            padding: '5px',
                            textAlign: 'center'
                        }}>0x{toHexString(value)}</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}

export default RegisterDisplay;

