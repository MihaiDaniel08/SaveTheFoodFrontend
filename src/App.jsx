import './App.css'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {UserProvider} from "./components/UserContext.jsx";
import {Login} from "./components/Login.jsx";
import {Register} from "./components/Register.jsx";
import {Main} from "./components/Main.jsx";

function App() {
    return (
        <UserProvider>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/main" element={<Main/>} />
            </Routes>
        </BrowserRouter>
        </UserProvider>
    )
}

export default App