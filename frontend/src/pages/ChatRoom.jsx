import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../api/client.js";

const socket = io("http://localhost:5000");

export default function ChatRoom() {
  const { matchId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get(`/chat/${matchId}`).then((res) => setMessages(res.data));
    socket.emit("join-match", matchId);

    socket.on("receive-message", (msg) => setMessages((prev) => [...prev, msg]));
    return () => socket.off("receive-message");
  }, [matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const { data } = await api.post(`/chat/${matchId}`, { text });
    socket.emit("send-message", { matchId, message: data });
    setMessages((prev) => [...prev, data]);
    setText("");
  };

  return (
    <div className="chat-room">
      <div className="messages">
        {messages.map((m) => (
          <div key={m._id} className="message">{m.text}</div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="chat-input">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
