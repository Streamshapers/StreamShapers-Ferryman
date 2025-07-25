import JsonElementsDisplay from "./ElementDisplays/JsonElementsDisplay";
import Splitter from "./Splitter";
import {useContext} from "react";
import {GlobalStateContext} from "./Context/GlobalStateContext";
import Player from "./Player/Player";
import TemplatePerformanceTester from "./TemplatePerformanceTester";

function ConverterView() {
    const {jsonData} = useContext(GlobalStateContext);

    if (!jsonData) {
        return null;
    }

    return (
        <div className="container">
            <TemplatePerformanceTester/>
            <div id="contentWrapper">
                <div id="jsonElements"><JsonElementsDisplay/></div>
                <Splitter/>
                <div id="jsonPreview"><Player/></div>
            </div>
        </div>
    );
}

export default ConverterView;
