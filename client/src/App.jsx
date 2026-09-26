import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import TipPage from "./pages/TipPage.jsx";
import Overlay from "./pages/Overlay";
import TipHistory from "./pages/TipHistory";

function App() {
    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />
                <Route
    path="/dashboard/tips"
    element={<TipHistory />}
/>
                <Route
    path="/overlay/:overlayKey"
    element={<Overlay />}
/>

                <Route
                    path="/:username"
                    element={<TipPage />}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;