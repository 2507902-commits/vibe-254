import { useEffect, useState } from "react";
import api from "../api/client.js";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    api.get("/profile/me").then((res) => {
      setProfile(res.data);
      setBio(res.data.bio || "");
    });
  }, []);

  const save = async () => {
    setSaveStatus("Saving...");
    try {
      const { data } = await api.put("/profile/me", { bio, profileComplete: true });
      setProfile(data);
      setSaveStatus("Profile saved ✓");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (err) {
      setSaveStatus(err.response?.data?.message || "Save failed");
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const { data } = await api.post("/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile((prev) => ({ ...prev, photos: data.photos }));
    } catch (err) {
      setUploadError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removePhoto = async (photoUrl) => {
    const { data } = await api.delete("/profile/photo", { data: { photoUrl } });
    setProfile((prev) => ({ ...prev, photos: data.photos }));
  };

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="profile-page">
      <h2>{profile.fullName}</h2>
      <p>{profile.userType === "student" ? "Student" : "Professional"} • {profile.institutionOrCompany}</p>

      <div className="photo-grid">
        {profile.photos?.map((url) => (
          <div key={url} className="photo-thumb">
            <img src={url} alt="" />
            <button onClick={() => removePhoto(url)}>✕</button>
          </div>
        ))}
      </div>

      <label className="upload-btn">
        {uploading ? "Uploading..." : "Add Photo"}
        <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} hidden />
      </label>
      {uploadError && <p className="error">{uploadError}</p>}

      <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell people about yourself..." maxLength={500} />
      <button onClick={save}>Save Profile</button>
      {saveStatus && <p>{saveStatus}</p>}
      {profile.isPremium && <p className="premium-badge">✨ Vibe254 Premium</p>}
    </div>
  );
}