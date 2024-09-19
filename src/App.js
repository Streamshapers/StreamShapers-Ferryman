import './App.css';
import './mediaQuerys.css';
import Header from "./Header";
import ConverterView from "./ConverterView";
import StartScreen from "./StartScreen/StartScreen";
import DropJson from "./DropJson";
import WindowTooNarrowWarning from "./WindowToNarrowWarning";

function App() {
    return (
        <>
            <DropJson/>
            <WindowTooNarrowWarning/>
            <div id="content">
                <Header/>
                <ConverterView/>
                <StartScreen/>
            </div>
        </>
    );
}

export default App;
