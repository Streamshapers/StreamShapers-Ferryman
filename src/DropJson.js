import {useEffect, useContext} from 'react';
import {GlobalStateContext} from "./Context/GlobalStateContext";

function DropJson() {
    const {setJsonFile, setFileName} = useContext(GlobalStateContext);

    useEffect(() => {
        const handleDragOver = (e) => {
            e.preventDefault();
        };

        const handleDrop = (e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const fileExtension = file.name.split('.').pop().toLowerCase();

                    if (file.type === "application/json" || fileExtension === "json") {
                        setJsonFile(file);
                        setFileName(file.name.replace(/\.json$/, ''));
                    } //else if (["ttf", "otf", "woff"].includes(fileExtension)) {
                      //  setFontFile(file);
                    //}
                    else {
                        console.error("Nicht unterstützter Dateityp.");
                    }
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
