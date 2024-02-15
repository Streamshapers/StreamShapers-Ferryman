import './App.css';
import JsonFileProcessor from "./JsonFileProcessor";
import { GlobalStateProvider} from "./GlobalStateContext";
import JsonElementsDisplay from "./JsonElementsDisplay";
import LottiePreview from "./LottiePreview";

function App() {
    return (
        <GlobalStateProvider>
            <div className="container">
                <div id="headerContainer">
                    <h1>JSON zu CasparCG Template Converter v0.2.4</h1>
                    <JsonFileProcessor/>
                </div>
                <div id="previewContainer">
                    <div id="jsonElements">
                        <JsonElementsDisplay/>
                    </div>
                    <div id="splitBar"></div>
                    <div id="jsonPreview">
                        {<LottiePreview />}
                    </div>
                </div>
                <div id="bottomContainer">
                    <div id="fileName">
                        <label htmlFor="fileNameInput" id="fileNameInputLabel">Filename:</label>
                        <input type="text" id="fileNameInput"/>
                        <span id="fileType">.html</span>
                    </div>
                    <div id="exportOptions">
                        <label htmlFor="export-format">Export Format:</label>
                        <select name="export-format" id="export-format">
                            <option value="combined">HTML with integrated JSON</option>
                            {/* <option value="separate">Separate HTML und JSON (Zip)</option> */}
                            <option value="json">JSON</option>
                        </select>
                    </div>
                    <button id="downloadBtn">Download File</button>
                    <div id="lastBottom"></div>
                </div>

            </div>
        </GlobalStateProvider>
    );
}

export default App;
