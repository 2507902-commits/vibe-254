import { useEffect, useState } from "react";
import api from "../api/client.js";

export default function Discover() {
  const [candidates, setCandidates] = useState([]);
  const [index, setIndex] = useState(0);
  const [matchPopup, setMatchPopup] = useState(null);

  useEffect(() => {
    api.get("/match/discover").then((res) => setCandidates(res.data));
  }, []);

  const current = candidates[index];

  const like = async () => {
    if (!current) return;
    const { data } = await api.post(`/match/like/${current._id}`);
    if (data.matched) setMatchPopup(current);
    setIndex((i) => i + 1);
  };

  const skip = () => setIndex((i) => i + 1);

  if (!current) return <div className="empty-state">No more profiles right now — check back later!</div>;

  return (
    <div className="discover-page">
      <div className="swipe-card">
        <img src={current.photos?.[0] || "/placeholder.jpg"} alt={current.fullName} />
        <h2>{current.fullName}</h2>
        <p>{current.userType === "student" ? current.institutionOrCompany : current.institutionOrCompany}</p>
        <p>{current.county}</p>
        <p>{current.bio}</p>
      </div>
      <div className="swipe-actions">
        <button className="skip" onClick={skip}>✕ Skip</button>
        <button className="like" onClick={like}>♥ Like</button>
      </div>

      {matchPopup && (
        <div className="match-popup" onClick={() => setMatchPopup(null)}>
          <h2>It's a Vibe! 🎉</h2>
          <p>You and {matchPopup.fullName} matched.</p>
        </div>
      )}
    </div>
  );
}
