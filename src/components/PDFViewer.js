import React, {useRef} from 'react';
import './PDFViewer.css';

function PDFViewer() {
    const pdfDialogRef = useRef(null);

    const handleClick = () => {
        if (pdfDialogRef.current) {
            if (pdfDialogRef.current.open) {
                pdfDialogRef.current.close();
            } else {
                pdfDialogRef.current.showModal();
            }
        }
    }

    return (
        <>
            <button onClick={handleClick}>View Manual</button>
            <dialog ref={pdfDialogRef} className="viewer-dialog">
                <button onClick={handleClick} className="close-button">Close</button>
                <iframe
                    src="https://s3-eu-west-1.amazonaws.com/downloads-mips/documents/MD00086-2B-MIPS32BIS-AFP-6.06.pdf"
                    title="MIPS Instruction Manual"
                    height="800px"
                    width="1000px"
                >
                </iframe>
            </dialog>
        </>
    )
}

export default PDFViewer;