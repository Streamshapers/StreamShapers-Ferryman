import JsonElementsDisplay from "./ElementDisplays/JsonElementsDisplay";
import Splitter from "./Splitter";
import LottiePreview from "./LottiePreview";
import { useContext } from "react";
import { GlobalStateContext } from "./GlobalStateContext";

function ConverterView() {
    const { jsonData } = useContext(GlobalStateContext);

    if (!jsonData) {
        return null;
    }

    return (
        <div className="container">
            <div id="contentWrapper">
                <div id="jsonElements"><JsonElementsDisplay/></div>
                <Splitter/>
                <div id="jsonPreview"><LottiePreview/></div>
            </div>
        </div>
    );
}

export default ConverterView;
