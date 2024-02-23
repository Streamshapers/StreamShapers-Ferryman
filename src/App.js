import './App.css';
import {GlobalStateProvider} from "./GlobalStateContext";
import Header from "./Header";
import ConverterView from "./ConverterView";
import StartScreen from "./StartScreen";
import DropJson from "./DropJson";

function App() {
    return (
        <>
            <DropJson/>
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
