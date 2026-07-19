import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/client.js";
import { COUNTRIES } from "../constants/countries.js";

export default function Signup() {
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", password: "", dob: "",
    gender: "male", interestedIn: "everyone", userType: "student",
    institutionOrCompany: "", country: "Kenya", county: "", region: "",
  });
  const [counties, setCounties] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/profile/counties").then((res) => setCounties(res.data));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/signup", form);
      localStorage.setItem("vibe254_token", data.token);
      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="auth-page">
      <h1>Join Vibe254</h1>
      <form onSubmit={handleSubmit}>
        <input name="fullName" placeholder="Full name" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="phone" placeholder="Phone (2547XXXXXXXX)" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <label>Date of birth
          <input name="dob" type="date" onChange={handleChange} required />
        </label>
        <select name="gender" onChange={handleChange}>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <select name="interestedIn" onChange={handleChange}>
          <option value="everyone">Interested in everyone</option>
          <option value="male">Men</option>
          <option value="female">Women</option>
        </select>
        <select name="userType" onChange={handleChange}>
          <option value="student">University student</option>
          <option value="professional">Young professional</option>
        </select>
        <input name="institutionOrCompany" placeholder="University or company" onChange={handleChange} />
        <select name="country" value={form.country} onChange={handleChange}>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {form.country === "Kenya" ? (
          <select name="county" onChange={handleChange} defaultValue="">
            <option value="" disabled>Select your county</option>
            {counties.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        ) : (
          <input name="region" placeholder="State / Province / City" onChange={handleChange} />
        )}
        {error && <p className="error">{error}</p>}
        <button type="submit">Sign Up</button>
      </form>
      <p>Already have an account? <Link to="/login">Log in</Link></p>
    </div>
  );
}
