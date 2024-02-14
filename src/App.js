import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import JsonFileProcessor from "./JsonFileProcessor";
import {GlobalStateProvider} from "./GlobalStateContext";
import JsonElementsDisplay from "./JsonElementsDisplay";
import React from "react";

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
                <i className='fa-solid fa-backward-steppreviewControlButton' title="frame back (Pause)"></i>
                <button id="playPauseButton" className="previewControlButton" title="Play/Pause">
                  <i className="fa-solid fa-pause"></i>
                </button>
                <i className="fa-solid fa-forward-step previewControlButton" title="next Frame (Pause)"></i>
                <i className="fa-solid fa-forward-fast previewControlButton" title="play next section"></i>
                <i className="fa-solid fa-circle-down previewControlButton" title="Download current Frame"></i>
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
