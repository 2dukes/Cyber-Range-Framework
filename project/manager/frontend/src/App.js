import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect, useRef } from 'react';
import AvailableScenarios from "./pages/AvailableScenarios";
import SolvedScenarios from "./pages/SolvedScenarios";
import { useSnackbar } from 'notistack';

const App = () => {
    const [launchData, setLaunchData] = useState([]);
    const [launchedScenario, setLaunchedScenario] = useState(null);
    const [wsConnected, setWSConnected] = useState(false);
    const infoRef = useRef(null);
    const { enqueueSnackbar } = useSnackbar();

    const scrollToBottom = () => {
        infoRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const setupWS = () => {
            // Create a new WebSocket instance
            let ws = new WebSocket(`ws://${process.env.REACT_APP_MACHINE_HOSTNAME}:8080`);

            ws.onopen = () => {
                setWSConnected(true);
            };

            // Handle incoming messages from the server
            ws.onmessage = async (event) => {
                if (event.data.length > 0) {
                    setLaunchData((prev) => [...prev, event.data]);
                    scrollToBottom();
                }
                if (/^Process Exited With Status Code: [1-9][0-9]{0,2}$/.test(event.data)) {
                    enqueueSnackbar('An error occurred while executing scenario. Please try again.', { variant: "error", preventDuplicate: true, style: { fontFamily: "Roboto, Helvetica, Arial, sans-serif" } });
                    setTimeout(() => window.location.reload(), 2000);
                }
            };

            ws.onclose = () => {
                setWSConnected(false);
                setTimeout(() => setupWS(), 1000);
            };

            return ws;
        };

        setupWS();
    }, [enqueueSnackbar]);

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    exact
                    path="/"
                    key="/"
                    element={<AvailableScenarios key="/" infoRef={infoRef} wsConnected={wsConnected} launchedScenario={launchedScenario} setLaunchedScenario={setLaunchedScenario} launchData={launchData} setLaunchData={setLaunchData} />}
                />
                <Route
                    exact
                    path="/solved"
                    key="/solved"
                    element={<SolvedScenarios key="/solved" />}
                />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
