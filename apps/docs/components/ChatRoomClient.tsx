"use client";

import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

type ChatMessage = {
  message: string;
};

type ChatPayload =
  | { type: "chat"; message: ChatMessage | string }
  | { type: "join_room"; roomId: string };

export function ChatRoomClient({
  messages,
  id,
}: {
  messages: ChatMessage[];
  id: string;
}) {
  const [chats, setChats] = useState<ChatMessage[]>(messages);
  const [currentmessage, setCurrentmessage] = useState("");
  const { socket, loading } = useSocket();

  useEffect(() => {
    if (!socket || loading) return;

    socket.send(
      JSON.stringify({
        type: "join_room",
        roomId: id,
      })
    );

    const handleMessage = (event: MessageEvent<string>) => {
      const parsedData: ChatPayload = JSON.parse(event.data);

      if (parsedData.type === "chat") {
        setChats((prev) => [
          ...prev,
          typeof parsedData.message === "string"
            ? { message: parsedData.message }
            : parsedData.message,
        ]);
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket, loading, id]);

  return (
    <div>
      {chats.map((m, i) => (
        <div key={i}>{m.message}</div>
      ))}

      <input
        type="text"
        value={currentmessage}
        onChange={(e) => setCurrentmessage(e.target.value)}
      />

      <button
        onClick={() => {
          if (!currentmessage.trim()) return;

          socket?.send(
            JSON.stringify({
              type: "chat",
              roomId: id,
              message: currentmessage,
            })
          );

          setCurrentmessage("");
        }}
      >
        Send message
      </button>
    </div>
  );
}
