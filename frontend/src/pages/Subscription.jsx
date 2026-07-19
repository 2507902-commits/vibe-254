import { useEffect, useState } from "react";
import api from "../api/client.js";

export default function Subscription() {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");
  const [country, setCountry] = useState(null);

  useEffect(() => {
    api.get("/profile/me").then((res) => setCountry(res.data.country));
  }, []);

  const isKenya = country === "Kenya";

  const subscribeMpesa = async (e) => {
    e.preventDefault();
    setStatus("Sending M-Pesa prompt...");
    try {
      await api.post("/subscription/subscribe", { phoneNumber: phone });
      setStatus("Check your phone for the M-Pesa prompt to complete payment.");
    } catch (err) {
      setStatus(err.response?.data?.message || "Something went wrong");
    }
  };

  const subscribeStripe = async () => {
    setStatus("Redirecting to secure checkout...");
    try {
      const { data } = await api.post("/subscription/subscribe", {});
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setStatus(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="subscription-page">
      <h2>Vibe254 Premium</h2>
      <p>{isKenya ? "KES 250 / month" : "$2 / month"}</p>
      <ul>
        <li>Unlimited swipes</li>
        <li>See who liked you</li>
        <li>Priority placement in Discover</li>
      </ul>

      {country === null && <p>Loading...</p>}

      {isKenya && (
        <form onSubmit={subscribeMpesa}>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="2547XXXXXXXX" required />
          <button type="submit">Subscribe with M-Pesa</button>
        </form>
      )}

      {country && !isKenya && (
        <button onClick={subscribeStripe}>Subscribe with Card (Stripe)</button>
      )}

      {status && <p>{status}</p>}
    </div>
  );
}
