import React, { useState } from 'react';

function Splitter() {
    const [mouseIsDown, setMouseIsDown] = useState(false);

    const handleMouseDown = () => {
        setMouseIsDown(true);
        document.body.style.userSelect = 'none';
    };

    const handleMouseMove = (e) => {
        if (!mouseIsDown) return;

        const leftPanel = document.getElementById('jsonElements');
        const newWidth = e.clientX - 30;
        if(leftPanel) leftPanel.style.width = `${newWidth}px`;
    };

    const handleMouseUp = () => {
        setMouseIsDown(false);
        document.body.style.userSelect = 'auto';
    };

    React.useEffect(() => {
        if (mouseIsDown) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [mouseIsDown]);

    return (
        <div
            id="splitBar"
            onMouseDown={handleMouseDown}
            style={{ cursor: 'col-resize' }}
        >
        </div>
    );
}

export default Splitter;
