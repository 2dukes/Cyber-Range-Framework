import { BrowserRouter, Routes, Route } from "react-router-dom";
import AvailableScenarios from "./pages/AvailableScenarios";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    exact
                    path="/"
                    key="/"
                    element={
                        <AvailableScenarios key="/" />
                    }
                />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
