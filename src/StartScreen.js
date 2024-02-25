import {useContext} from "react";
import {GlobalStateContext} from "./GlobalStateContext";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChartPie, faChartSimple, faFileArrowUp, faList} from "@fortawesome/free-solid-svg-icons";

function StartScreen() {
    const {jsonData, setJsonFile, setFileName, setError, error} = useContext(GlobalStateContext);

    const handleSampleFile = async (fileName) => {
        const response = await fetch(`./samples/${fileName}`);
        if (!response.ok) {
            console.error("Fehler beim Laden der Datei:", fileName);
            return;
        }
        const text = await response.text();
        const blob = new Blob([text], { type: 'application/json' });

        setJsonFile(blob);
        setFileName(fileName.replace(/\.json$/, ''));
    };

    function handleFileChange(file) {
        if (!file) {
            setError("Select a file please.");
            return;
        }
        if (file.type !== 'application/json') {
            setError("Please select a valid JSON file.");
            return;
        }

        setFileName(file.name.replace(/\.json$/, ''));

        setJsonFile(file);
    }

    if (jsonData) {
        return null;
    }

    return (
        <div id="startScreenContainer">
            <div id="startWrapper">
                <div id="uploadWrapper">
                    <h2>Drop JSON to start</h2>
                    <div id="uploadIcon">
                        <FontAwesomeIcon icon={faFileArrowUp}/>
                    </div>
                    <h2>or</h2>
                    <input type="file" id="jsonFile" accept=".json"
                           onChange={(e) => handleFileChange(e.target.files[0])}/>
                    {error && <div className="error-message">{error}</div>}
                </div>
                <div id="sampleWrapper">
                    <h2>Or start with one of our Samples:</h2>
                    <div id="samples">
                        <div className="sample" onClick={() => handleSampleFile("BarChart_Ver05.json")}>
                            <FontAwesomeIcon className="icon" icon={faChartSimple}/>
                            <h4>BarChart</h4>
                        </div>
                        <div className="sample" onClick={() => handleSampleFile("PieChart_Ver03.json")}>
                            <FontAwesomeIcon className="icon" icon={faChartPie}/>
                            <h4>PieChart</h4>
                        </div>
                        <div className="sample" onClick={() => handleSampleFile("List_Ver02.json")}>
                            <FontAwesomeIcon className="icon" icon={faList}/>
                            <h4>List</h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StartScreen;