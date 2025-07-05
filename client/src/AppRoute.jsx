import { Route, Routes } from "react-router-dom"
import Home from "./Home"
import JoinARoom from "./JoinARoom"
import CreateARoom from "./CreateARoom"
import ChatRoom from "./ChatRoom"

function AppRoute() {
    return (
        <>
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
