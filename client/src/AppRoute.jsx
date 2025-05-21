import { Route, Routes } from "react-router-dom"
import Home from "./Home"
import JoinARoom from "./JoinARoom"
import CreateARoom from "./CreateARoom"

function AppRoute() {
    return (
        <>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/join" element={<JoinARoom />} />
                <Route path="/create" element={<CreateARoom />} />
            </Routes>
        </>
    )
}

export default AppRoute
