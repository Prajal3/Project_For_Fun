import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { AuthContex } from "./authContex";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContex);
  const socketRef = useRef(null);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      const socket = io("http://localhost:5000", {
        withCredentials: true,
      });

      socketRef.current = socket;

      socket.emit("register", currentUser._id);

      socket.on("onlineCount", (count) => {
        setOnlineCount(count);
      });

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    }
  }, [currentUser]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, onlineCount }}>
      {children}
    </SocketContext.Provider>
  );
};