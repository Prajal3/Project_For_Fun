import { useContext, useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Send, SkipForward, X, Loader2, MessageCircle, ArrowLeft } from "lucide-react";
import { AuthContex } from "../context/authContex";
import { io } from "socket.io-client";

const CHAT_STATES = {
  IDLE: "idle",
  SEARCHING: "searching",
  CHATTING: "chatting",
  DISCONNECTED: "disconnected",
};

const RandomChat = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContex);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [chatState, setChatState] = useState(CHAT_STATES.IDLE);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);

  // Init socket once
  useEffect(() => {
    const socket = io("http://localhost:5000", { withCredentials: true });
    socketRef.current = socket;

    if (currentUser?._id) {
      socket.emit("register", currentUser._id);
    }

    socket.on("onlineCount", setOnlineCount);

    socket.on("searching", () => setChatState(CHAT_STATES.SEARCHING));

    socket.on("partnerFound", () => {
      setChatState(CHAT_STATES.CHATTING);
      setMessages([
        {
          id: Date.now(),
          text: "You're now chatting with a stranger. Say hi! 👋",
          type: "system",
        },
      ]);
      inputRef.current?.focus();
    });

    socket.on("chatMessage", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: data.text,
          type: "stranger",
          timestamp: data.timestamp,
        },
      ]);
    });

    socket.on("partnerTyping", (isTyping) => {
      setPartnerTyping(isTyping);
    });

    socket.on("partnerDisconnected", () => {
      setChatState(CHAT_STATES.DISCONNECTED);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "Stranger has disconnected.",
          type: "system",
        },
      ]);
      setPartnerTyping(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, partnerTyping]);

  const startSearch = () => {
    setMessages([]);
    setPartnerTyping(false);
    socketRef.current?.emit("findPartner");
  };

  const skipPartner = () => {
    socketRef.current?.emit("skipPartner");
    setChatState(CHAT_STATES.IDLE);
    setMessages([]);
    setPartnerTyping(false);
  };

  const sendMessage = useCallback(() => {
    const text = inputText.trim();
    if (!text || chatState !== CHAT_STATES.CHATTING) return;

    socketRef.current?.emit("chatMessage", { text });
    socketRef.current?.emit("typing", false);

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text, type: "me", timestamp: Date.now() },
    ]);
    setInputText("");
  }, [inputText, chatState]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTyping = (e) => {
    setInputText(e.target.value);

    if (chatState !== CHAT_STATES.CHATTING) return;

    socketRef.current?.emit("typing", true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("typing", false);
    }, 1500);
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/10 backdrop-blur-md border-b border-white/20">
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 text-white hover:text-white/80 transition"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline text-sm font-medium">Back</span>
        </button>

        <div className="flex items-center gap-2">
          <MessageCircle className="text-white" size={22} />
          <h1 className="text-white font-bold text-lg">Random Chat</h1>
        </div>

        <div className="flex items-center gap-1 bg-green-500/20 border border-green-400/40 rounded-full px-3 py-1">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white text-xs font-medium">
            {onlineCount.toLocaleString()} online
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col max-w-2xl w-full mx-auto p-4 gap-4">

        {/* IDLE state */}
        {chatState === CHAT_STATES.IDLE && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 flex flex-col items-center gap-4 text-center border border-white/20">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="text-white" size={40} />
              </div>
              <h2 className="text-3xl font-bold text-white">Start Chatting</h2>
              <p className="text-white/70 max-w-xs">
                Click below to be matched with a random stranger instantly.
              </p>
              <button
                onClick={startSearch}
                className="mt-2 px-8 py-3 bg-white text-indigo-700 font-bold rounded-full hover:scale-105 transition shadow-lg"
              >
                Find a Stranger
              </button>
            </div>
          </div>
        )}

        {/* SEARCHING state */}
        {chatState === CHAT_STATES.SEARCHING && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 flex flex-col items-center gap-5 text-center border border-white/20">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-white/30 border-t-white animate-spin" />
                <Loader2 className="absolute inset-0 m-auto text-white/0" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white">Looking for someone...</h2>
              <p className="text-white/70">This won't take long ✨</p>
              <button
                onClick={() => {
                  socketRef.current?.emit("skipPartner");
                  setChatState(CHAT_STATES.IDLE);
                }}
                className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* CHATTING / DISCONNECTED state */}
        {(chatState === CHAT_STATES.CHATTING || chatState === CHAT_STATES.DISCONNECTED) && (
          <>
            {/* Messages */}
            <div className="flex-1 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 flex flex-col overflow-hidden">
              {/* Chat toolbar */}
              <div className="flex items-center justify-between px-4 py-2 bg-white/10 border-b border-white/20">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      chatState === CHAT_STATES.CHATTING ? "bg-green-400 animate-pulse" : "bg-gray-400"
                    }`}
                  />
                  <span className="text-white/80 text-sm">
                    {chatState === CHAT_STATES.CHATTING ? "Stranger" : "Disconnected"}
                  </span>
                </div>

                <div className="flex gap-2">
                  {chatState === CHAT_STATES.CHATTING && (
                    <button
                      onClick={skipPartner}
                      className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-200 rounded-lg text-xs transition"
                    >
                      <SkipForward size={14} />
                      Skip
                    </button>
                  )}
                  {chatState === CHAT_STATES.DISCONNECTED && (
                    <button
                      onClick={startSearch}
                      className="flex items-center gap-1 px-3 py-1 bg-indigo-500/40 hover:bg-indigo-500/60 text-white rounded-lg text-xs transition"
                    >
                      <SkipForward size={14} />
                      Find New
                    </button>
                  )}
                  <button
                    onClick={() => {
                      skipPartner();
                      setChatState(CHAT_STATES.IDLE);
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-200 rounded-lg text-xs transition"
                  >
                    <X size={14} />
                    End
                  </button>
                </div>
              </div>

              {/* Messages list */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0" style={{ maxHeight: "60vh" }}>
                {messages.map((msg) => {
                  if (msg.type === "system") {
                    return (
                      <div key={msg.id} className="text-center">
                        <span className="text-white/50 text-xs bg-white/10 px-3 py-1 rounded-full">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }

                  const isMe = msg.type === "me";
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[75%]">
                        {!isMe && (
                          <p className="text-white/50 text-xs mb-1 ml-1">Stranger</p>
                        )}
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow ${
                            isMe
                              ? "bg-white text-indigo-800 rounded-br-sm"
                              : "bg-white/20 text-white rounded-bl-sm"
                          }`}
                        >
                          {msg.text}
                        </div>
                        {msg.timestamp && (
                          <p className={`text-white/30 text-xs mt-1 ${isMe ? "text-right mr-1" : "ml-1"}`}>
                            {formatTime(msg.timestamp)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Typing indicator */}
                {partnerTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/20 px-4 py-3 rounded-2xl rounded-bl-sm">
                      <div className="flex gap-1 items-center">
                        <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input area */}
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder={
                  chatState === CHAT_STATES.CHATTING
                    ? "Type a message..."
                    : "Stranger disconnected"
                }
                value={inputText}
                onChange={handleTyping}
                onKeyDown={handleKeyDown}
                disabled={chatState !== CHAT_STATES.CHATTING}
                className="flex-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-5 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={sendMessage}
                disabled={!inputText.trim() || chatState !== CHAT_STATES.CHATTING}
                className="w-12 h-12 bg-white text-indigo-700 rounded-full flex items-center justify-center hover:scale-105 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
              >
                <Send size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RandomChat;