import React, { useState } from 'react';

function SourceSelectionPopup({ isOpen, onClose, onSelectSource }) {
    const [source, setSource] = useState('');
    const [googleTableUrl, setGoogleTableUrl] = useState('');
    const [googleTableCell, setGoogleTableCell] = useState('');

    const handleSourceChange = (e) => {
        setSource(e.target.value);
        if (e.target.value !== 'Google Table') {
            onSelectSource({ type: e.target.value });
        }
    };

    const handleSubmit = () => {
        if (source === 'Google Table') {
            onSelectSource({ type: 'Google Table', url: googleTableUrl, cell: googleTableCell });
        }
        onClose();
    };

    return (
        isOpen ? (
            <div style={{ position: 'absolute', top: '20%', left: '30%', backgroundColor: 'white', padding: '20px', border: '1px solid black' }}>
                <select value={source} onChange={handleSourceChange}>
                    <option value="">Wähle eine Quelle</option>
                    <option value="Google Table">Google Table</option>
                    <option value="CSV">CSV</option>
                    <option value="Other">Andere</option>
                </select>
                {source === 'Google Table' && (
                    <>
                        <input
                            type="text"
                            value={googleTableUrl}
                            onChange={(e) => setGoogleTableUrl(e.target.value)}
                            placeholder="URL der Google-Tabelle"
                        />
                        <input
                            type="text"
                            value={googleTableCell}
                            onChange={(e) => setGoogleTableCell(e.target.value)}
                            placeholder="Zellbezeichnung"
                        />
                    </>
                )}
                <div>
                    <button onClick={handleSubmit}>Bestätigen</button>
                    <button onClick={onClose}>Schließen</button>
                </div>
            </div>
        ) : null
    );
}

export default SourceSelectionPopup;
