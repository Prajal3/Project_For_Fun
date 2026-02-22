import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, MessageSquare, Globe, Video, Zap } from "lucide-react";
import { AuthContex } from "../context/authContex";
import { io } from "socket.io-client";

const Home = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useContext(AuthContex);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    if (!currentUser) { navigate("/"); return; }
    const socket = io("http://localhost:5000", { withCredentials: true });
    socket.emit("register", currentUser._id);
    socket.on("onlineCount", setOnlineCount);
    return () => socket.disconnect();
  }, [currentUser, navigate]);

  const chatModes = [
    {
      title: "Text Chat",
      description: "Connect with random strangers via instant messaging",
      icon: MessageSquare,
      gradient: "from-indigo-500 via-purple-500 to-violet-600",
      glow: "shadow-violet-900/50",
      action: () => navigate("/chat"),
      badge: "Live",
    },
    {
      title: "Video Chat",
      description: "Face-to-face video calls with people worldwide",
      icon: Video,
      gradient: "from-fuchsia-500 via-pink-500 to-rose-500",
      glow: "shadow-fuchsia-900/50",
      action: () => navigate("/video"),
      badge: "New",
    },
  ];

  const handleLogout = () => { logout(); navigate("/"); };

  if (!currentUser) return null;

  const displayName = currentUser.fullname || currentUser.fullName || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-125 h-125 bg-violet-700/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-125 h-125 bg-fuchsia-700/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-700/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* ── HEADER ── */}
        <header className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
              {initial}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{displayName}</p>
              <p className="text-white/40 text-xs">Welcome back to BhetGhat</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 text-sm transition"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </header>

        {/* ── HERO ── */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-10">
          {/* Online badge */}
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-full border"
            style={{ background: "rgba(16,185,129,0.1)", borderColor: "rgba(16,185,129,0.2)" }}
          >
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-400 font-bold text-lg">{onlineCount.toLocaleString()}</span>
            </span>
            <span className="text-white/40 text-sm">|</span>
            <div className="flex items-center gap-1.5 text-white/50 text-sm">
              <Globe size={14} />
              <span>people online worldwide</span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4 leading-tight tracking-tight">
              Meet{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, #a78bfa, #f472b6)" }}
              >
                strangers.
              </span>
              <br />
              Make connections on BhetGhat.
            </h1>
            <p className="text-white/40 text-lg max-w-md mx-auto">
              Instant, anonymous chats with real people from every corner of the world.
            </p>
          </div>

          {/* Chat mode cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">
            {chatModes.map((mode, i) => {
              const Icon = mode.icon;
              return (
                <button
                  key={i}
                  onClick={mode.action}
                  className={`group relative text-left rounded-2xl p-6 border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 hover:scale-[1.02] hover:border-white/20 hover:shadow-2xl ${mode.glow} overflow-hidden`}
                >
                  {/* Badge */}
                  <span
                    className="absolute top-4 right-4 text-xs font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
                  >
                    {mode.badge}
                  </span>

                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-2xl bg-linear-to-br ${mode.gradient} flex items-center justify-center mb-5 shadow-lg`}
                  >
                    <Icon size={28} className="text-white" />
                  </div>

                  <h3 className="text-white font-bold text-xl mb-2">{mode.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{mode.description}</p>

                  {/* Arrow */}
                  <div className="mt-4 flex items-center gap-2 text-white/30 group-hover:text-white/60 transition text-sm">
                    <span>Start now</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </button>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;