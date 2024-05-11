import './App.css';
import Header from "./Header";
import ConverterView from "./ConverterView";
import StartScreen from "./StartScreen";
import DropJson from "./DropJson";
import WindowTooNarrowWarning from "./WindowToNarrowWarning";
import {useEffect} from "react";

function App() {
    return (
        <>
            <DropJson/>
            <WindowTooNarrowWarning />
            <div id="content">
                <Header/>
                <ConverterView/>
                <StartScreen/>
            </div>
        </>
    )
        ;
}

export default App;
