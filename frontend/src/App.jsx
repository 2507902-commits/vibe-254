import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Discover from "./pages/Discover.jsx";
import Matches from "./pages/Matches.jsx";
import ChatRoom from "./pages/ChatRoom.jsx";
import Profile from "./pages/Profile.jsx";
import Subscription from "./pages/Subscription.jsx";
import NavBar from "./components/NavBar.jsx";

const isAuthed = () => !!localStorage.getItem("vibe254_token");

const Protected = ({ children }) => (isAuthed() ? children : <Navigate to="/login" />);

export default function App() {
  return (
    <>
      {isAuthed() && <NavBar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Protected><Discover /></Protected>} />
        <Route path="/matches" element={<Protected><Matches /></Protected>} />
        <Route path="/chat/:matchId" element={<Protected><ChatRoom /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="/subscription" element={<Protected><Subscription /></Protected>} />
      </Routes>
    </>
  );
}
