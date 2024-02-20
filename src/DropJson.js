import { useEffect, useContext } from 'react';
import { GlobalStateContext } from "./GlobalStateContext";

function DropJson() {
    const { setJsonFile } = useContext(GlobalStateContext);

    useEffect(() => {
        const handleDragOver = (e) => {
            e.preventDefault();
        };

        const handleDrop = (e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (file.type === "application/json") {
                    setJsonFile(file);
                } else {
                    console.error("Bitte lade eine JSON-Datei hoch.");
                }
            }
        };

        document.addEventListener('dragover', handleDragOver);
        document.addEventListener('drop', handleDrop);

        return () => {
            document.removeEventListener('dragover', handleDragOver);
            document.removeEventListener('drop', handleDrop);
        };
    }, [setJsonFile]);

    return null;
}

export default DropJson;
