import {Routes, Route} from 'react-router-dom';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import DropJson from "./DropJson";
import WindowTooNarrowWarning from "./WindowToNarrowWarning";
import Header from "./Header";
import ConverterView from "./ConverterView";
import StartScreen from "./StartScreen/StartScreen";
import VerifyEmail from "./pages/VerifyEmail";

function App() {
    return (
        <>
            <DropJson/>
            <WindowTooNarrowWarning/>
            <div id="content">
                <Header/>

                <Routes>
                    <Route path="/" element={<><ConverterView/><StartScreen/></>}/>
                    <Route path="/forgot-password" element={<ForgotPassword/>}/>
                    <Route path="/reset-password" element={<ResetPassword/>}/>
                    <Route path="/verify-email" element={<VerifyEmail/>}/>
                </Routes>
            </div>
        </>
    );
}

export default App;
