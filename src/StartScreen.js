import React, {useContext} from "react";
import {GlobalStateContext} from "./GlobalStateContext";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faChartPie,
    faChartSimple,
    faFileArrowUp,
    faHashtag,
    faImage,
    faList, faRotate, faRotateRight,
    faUser
} from "@fortawesome/free-solid-svg-icons";

function StartScreen() {
    const {jsonData, setJsonFile, setFileName, setError, error} = useContext(GlobalStateContext);

    const handleSampleFile = async (fileName) => {
        const response = await fetch(`./samples/${fileName}`);
        if (!response.ok) {
            console.error("Fehler beim Laden der Datei:", fileName);
            return;
        }
        const text = await response.text();
        const blob = new Blob([text], {type: 'application/json'});

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
                    <h2>Or check out one of our Samples</h2>
                    <div id="samples">
                        <div className="sample" onClick={() => handleSampleFile("BarChart_Ver09.json")}>
                            <FontAwesomeIcon className="icon" icon={faChartSimple}/>
                            <h4>BarChart</h4>
                        </div>
                        <div className="sample" onClick={() => handleSampleFile("PieChart_Ver09.json")}>
                            <FontAwesomeIcon className="icon" icon={faChartPie}/>
                            <h4>PieChart</h4>
                        </div>
                        <div className="sample" onClick={() => handleSampleFile("LowerThird_Ver08_fontsEmbedded.json")}>
                            <FontAwesomeIcon className="icon" icon={faUser}/>
                            <h4>Lowerthird</h4>
                        </div>
                        <div className="sample" onClick={() => handleSampleFile("Cornerlogo_Ver04_fontsEmbedded.json")}>
                            <FontAwesomeIcon className="icon" icon={faHashtag}/>
                            <h4>Cornerlogo</h4>
                        </div>
                        <div className="sample" onClick={() => handleSampleFile("List_Ver06_fontsEmbedded.json")}>
                            <FontAwesomeIcon className="icon" icon={faList}/>
                            <h4>List</h4>
                        </div>
                        <div className="sample"
                             onClick={() => handleSampleFile("TodaysTeam_Ver02.json")}>
                            <FontAwesomeIcon className="icon" icon={faImage}/>
                            <h4>Images</h4>
                        </div>
                        <div className="sample" onClick={() => handleSampleFile("Balls_Rolling_Loop_Ver03.json")}>
                            <FontAwesomeIcon className="icon" icon={faRotate}/>
                            <h4>Loop</h4>
                        </div>
                        <div className="sample" onClick={() => handleSampleFile("Update_Values_Ver03.json")}>
                            <FontAwesomeIcon className="icon" icon={faRotateRight}/>
                            <h4>Update Animation</h4>
                        </div>
                    </div>
                </div>
                <br/>
                <p>Welcome to StreamShapers Ferryman!</p>
                <p>We hope this tool will help you to create your own real time graphics.
                    Ferryman is a work in progress, that's why you might encounter problems. If so, we want to
                    encourage you to report issues on <a href="https://github.com/Streamshapers/StreamShapers-Converter"
                                                         target="_blank" rel="noreferrer">GitHub</a> to us.
                </p>
                <p>For further improvements or ideas for more features find us on <a
                    href="https://discord.gg/ksNhRkzrM6" target="_blank" rel="noreferrer">Discord</a> or reach out
                    via <a href="mailto:mail@streamshapers.com" target="_blank" rel="noreferrer">Email</a>!
                </p>
                <p>Thank You ❤</p>
            </div>
        </div>
    );
}

export default StartScreen;