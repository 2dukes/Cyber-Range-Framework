import { BrowserRouter, Routes, Route } from "react-router-dom";
import AvailableScenarios from "./pages/AvailableScenarios";
import SolvedScenarios from "./pages/SolvedScenarios";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    exact
                    path="/"
                    key="/"
                    element={<AvailableScenarios key="/" />}
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
