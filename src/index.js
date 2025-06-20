import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import './mediaQuerys.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import {ThemeProvider} from './Theme/ThemeContext';
import {GlobalStateProvider} from "./Context/GlobalStateContext";
import {AuthProvider} from "./Context/AuthContext";

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <AuthProvider>
        <GlobalStateProvider>
            <ThemeProvider>
                <BrowserRouter>
                    <App/>
                </BrowserRouter>
            </ThemeProvider>
        </GlobalStateProvider>
    </AuthProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

serviceWorkerRegistration.register();

