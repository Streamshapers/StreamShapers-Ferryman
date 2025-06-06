import {Routes, Route} from 'react-router-dom';
import DropJson from "./DropJson";
import WindowTooNarrowWarning from "./WindowToNarrowWarning";
import Header from "./Header";
import ConverterView from "./ConverterView";
import StartScreen from "./StartScreen/StartScreen";

function App() {
    return (
        <>
            <DropJson/>
            <WindowTooNarrowWarning/>
            <div id="content">
                <Header/>

                <Routes>
                    <Route path="/" element={<><ConverterView/><StartScreen/></>}/>
                </Routes>
            </div>
        </>
    );
}

export default App;
