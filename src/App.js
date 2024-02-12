import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import JsonFileProcessor from "./JsonFileProcessor";
import {GlobalStateProvider} from "./GlobalStateContext";
import JsonElementsDisplay from "./JsonElementsDisplay";

function App() {
  return (
      <GlobalStateProvider>
      <div className="container">
        <div id="headerContainer">
          <h1>JSON zu CasparCG Template Converter v0.2.4</h1>
          <JsonFileProcessor />
        </div>
        <div id="previewContainer">
          <div id="jsonElements">
            <JsonElementsDisplay/>
          </div>
          <div id="splitBar"></div>
          <div id="jsonPreview">
            <div id="animationPreview"></div>
            <div id="previewControlContainer">
              <div id="progressBarContainer">
                <div id="progressBar"></div>
                <div id="markerContainer"></div>
              </div>
              <div id="previewControls">
                <div id="timeDisplay" title="Time (seconds:frame)">00:00</div>
                <FontAwesomeIcon icon="fa-solid fa-backward-step" className="previewControlButton" title="frame back (Pause)"/>
                <button id="playPauseButton" className="previewControlButton" title="Play/Pause">
                  <FontAwesomeIcon icon="fa-solid fa-pause" />
                </button>
                <FontAwesomeIcon icon="fa-solid fa-forward-step" className="previewControlButton" title="next Frame (Pause)"/>
                <FontAwesomeIcon icon="fa-solid fa-forward-fast" className="previewControlButton" title="play next section"/>
                <FontAwesomeIcon icon="fa -solid fa-circle-down" className="previewControlButton" title="Download current Frame"/>
              </div>
            </div>
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
