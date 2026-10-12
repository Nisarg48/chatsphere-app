import { Route, Routes, useLocation } from "react-router-dom"
import Home from "./Home"
import JoinARoom from "./JoinARoom"
import CreateARoom from "./CreateARoom"
import ChatRoom from "./ChatRoom"
import Navbar from "./components/Navbar"

function AppRoute() {
    const location = useLocation();
    const isChatRoom = location.pathname.startsWith('/chat');

    return (
        <>
            {!isChatRoom && <Navbar />}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/join" element={<JoinARoom />} />
                <Route path="/create" element={<CreateARoom />} />
                <Route path="/chat/:id" element={<ChatRoom />} />
            </Routes>
        </>
    )
}

export default AppRoute
