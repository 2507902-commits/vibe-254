import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";

export default function Matches() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    api.get("/match/mine").then((res) => setMatches(res.data));
  }, []);

  return (
    <div className="matches-page">
      <h2>Your Matches</h2>
      {matches.length === 0 && <p>No matches yet — go swipe!</p>}
      <ul>
        {matches.map((m) => (
          <li key={m._id}>
            <Link to={`/chat/${m._id}`}>{m.users.map((u) => u.fullName).join(" & ")}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
