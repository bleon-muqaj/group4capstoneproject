function RegisterDisplay({registerValues}) {
    const registerLabels = {
        0: '$zero',
        1: '$at',
        2: '$v0',
        3: '$v1',
        4: '$a0',
        5: '$a1',
        6: '$a2',
        7: '$a3',
        8: '$t0',
        9: '$t1',
        10: '$t2',
        11: '$t3',
        12: '$t4',
        13: '$t5',
        14: '$t6',
        15: '$t7',
        16: '$s0',
        17: '$s1',
        18: '$s2',
        19: '$s3',
        20: '$s4',
        21: '$s5',
        22: '$s6',
        23: '$s7',
        24: '$t8',
        25: '$t9',
        26: '$k0',
        27: '$k1',
        28: '$gp',
        29: '$sp',
        30: '$fp',
        31: '$ra'
    }

    function toHexString(number) {
        const hexString = number.toString(16);
        return hexString.padStart(8, '0');
    }

    return (
        <table style={{margin: '30px', border: '3px solid grey'}}>
            <thead>
            <tr>
                <td style={{width: '30%', border: '1px solid grey'}}>Name</td>
                <td style={{width: '30%', border: '1px solid grey'}}>Number</td>
                <td style={{width: '30%', border: '1px solid grey'}}>Value</td>
            </tr>
            </thead>
            <tbody>
            {registerValues.map((value, index) =>
                <tr>
                    <td style={{border: '1px solid grey'}}>{registerLabels[index]}</td>
                    <td style={{border: '1px solid grey'}}>{index}</td>
                    <td style={{border: '1px solid grey'}}>0x{toHexString(value)}</td>
                </tr>)}
            </tbody>
        </table>
    )
}

export default RegisterDisplay;