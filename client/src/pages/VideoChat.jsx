import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  CameraOff,
  Mic,
  MicOff,
  PhoneOff,
  SkipForward,
  MessageSquare,
  X,
  Send,
  Globe,
  Loader2,
  Video,
} from "lucide-react";
import { io } from "socket.io-client";
import { AuthContex } from "../context/authContex";

const STATES = {
  IDLE: "idle",
  SEARCHING: "searching",
  CONNECTING: "connecting",
  CALL: "call",
  ENDED: "ended",
};

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export default function VideoChat() {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContex);

  // Socket & WebRTC refs
  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const isInitiatorRef = useRef(false);

  // Video elements
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // State
  const [callState, setCallState] = useState(STATES.IDLE);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [partnerVideo, setPartnerVideo] = useState(true);
  const [partnerAudio, setPartnerAudio] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [callDuration, setCallDuration] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasRemoteStream, setHasRemoteStream] = useState(false);

  const typingTimeoutRef = useRef(null);
  const durationTimerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // ── GET LOCAL MEDIA ────────────────────────────────────────────────
  const getLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.error("Media error:", err);
      // Try audio only
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        setVideoEnabled(false);
        return stream;
      } catch {
        return null;
      }
    }
  }, []);

  // ── CREATE PEER CONNECTION ─────────────────────────────────────────
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (e) => {
      if (e.candidate && socketRef.current) {
        socketRef.current.emit("webrtc:ice", { candidate: e.candidate });
      }
    };

    pc.ontrack = (e) => {
      if (remoteVideoRef.current && e.streams[0]) {
        remoteVideoRef.current.srcObject = e.streams[0];
        setHasRemoteStream(true);
        setCallState(STATES.CALL);
        startDurationTimer();
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("PC state:", pc.connectionState);
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        handleCallEnd();
      }
    };

    pcRef.current = pc;
    return pc;
  }, []);

  // ── INITIATOR: CREATE OFFER ────────────────────────────────────────
  const startCall = useCallback(async () => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const pc = createPeerConnection();
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socketRef.current?.emit("webrtc:offer", { sdp: offer });
  }, [createPeerConnection]);

  // ── CLEANUP ────────────────────────────────────────────────────────
  const cleanupCall = useCallback(() => {
    clearInterval(durationTimerRef.current);
    pcRef.current?.close();
    pcRef.current = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setHasRemoteStream(false);
    setCallDuration(0);
    setPartnerTyping(false);
    setPartnerVideo(true);
    setPartnerAudio(true);
  }, []);

  const handleCallEnd = useCallback(() => {
    cleanupCall();
    setCallState(STATES.ENDED);
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: "system", text: "Call ended." },
    ]);
  }, [cleanupCall]);

  // ── DURATION TIMER ─────────────────────────────────────────────────
  const startDurationTimer = () => {
    clearInterval(durationTimerRef.current);
    durationTimerRef.current = setInterval(() => {
      setCallDuration((d) => d + 1);
    }, 1000);
  };

  const formatDuration = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  // ── SOCKET SETUP ───────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) { navigate("/"); return; }

    const socket = io("http://localhost:5000", { withCredentials: true });
    socketRef.current = socket;
    socket.emit("register", currentUser._id);
    socket.on("onlineCount", setOnlineCount);

    // Matched
    socket.on("videoPartnerFound", async ({ isInitiator }) => {
      isInitiatorRef.current = isInitiator;
      setCallState(STATES.CONNECTING);
      setMessages([{ id: Date.now(), type: "system", text: "Connected! 👋 Say hello." }]);
      setUnreadCount(0);

      const stream = await getLocalStream();
      if (!stream) return;

      if (isInitiator) {
        await startCall();
      } else {
        // Answerer — wait for offer
        const pc = createPeerConnection();
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      }
    });

    socket.on("videoSearching", () => setCallState(STATES.SEARCHING));

    // WebRTC signaling
    socket.on("webrtc:offer", async ({ sdp }) => {
      const pc = pcRef.current;
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("webrtc:answer", { sdp: answer });
    });

    socket.on("webrtc:answer", async ({ sdp }) => {
      const pc = pcRef.current;
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    socket.on("webrtc:ice", async ({ candidate }) => {
      const pc = pcRef.current;
      if (!pc || !candidate) return;
      try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
    });

    // Partner media state
    socket.on("partnerMediaState", ({ video, audio }) => {
      setPartnerVideo(video);
      setPartnerAudio(audio);
    });

    // Text messages during call
    socket.on("chatMessage", (data) => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), type: "stranger", text: data.text, ts: data.timestamp },
      ]);
      if (!showChat) setUnreadCount((c) => c + 1);
    });

    socket.on("partnerTyping", (v) => setPartnerTyping(v));

    socket.on("partnerDisconnected", () => {
      handleCallEnd();
      setCallState(STATES.ENDED);
    });

    return () => {
      socket.disconnect();
      cleanupCall();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line
  }, [currentUser]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, partnerTyping]);

  // Clear unread when opening chat
  useEffect(() => {
    if (showChat) setUnreadCount(0);
  }, [showChat]);

  // ── CONTROLS ───────────────────────────────────────────────────────
  const toggleVideo = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setVideoEnabled(track.enabled);
    socketRef.current?.emit("mediaState", { video: track.enabled, audio: audioEnabled });
  };

  const toggleAudio = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setAudioEnabled(track.enabled);
    socketRef.current?.emit("mediaState", { video: videoEnabled, audio: track.enabled });
  };

  const skipStranger = () => {
    cleanupCall();
    socketRef.current?.emit("skipVideoPartner");
    setMessages([]);
    setCallState(STATES.IDLE);
  };

  const endCall = () => {
    cleanupCall();
    socketRef.current?.emit("skipVideoPartner");
    setMessages([]);
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setCallState(STATES.IDLE);
  };

  const findStranger = async () => {
    setMessages([]);
    setCallState(STATES.SEARCHING);
    cleanupCall();

    if (!localStreamRef.current) {
      await getLocalStream();
    }
    socketRef.current?.emit("findVideoPartner");
  };

  // ── CHAT ───────────────────────────────────────────────────────────
  const sendChatMessage = () => {
    const text = chatInput.trim();
    if (!text) return;
    socketRef.current?.emit("chatMessage", { text });
    socketRef.current?.emit("typing", false);
    setMessages((prev) => [...prev, { id: Date.now(), type: "me", text, ts: Date.now() }]);
    setChatInput("");
  };

  const handleChatTyping = (e) => {
    setChatInput(e.target.value);
    socketRef.current?.emit("typing", true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("typing", false);
    }, 1500);
  };

  // ─────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────

  const isInCall = callState === STATES.CALL || callState === STATES.CONNECTING;

  return (
    <div className="h-screen bg-gray-950 flex flex-col overflow-hidden select-none">

      {/* ── TOP BAR ── */}
      <header
        className="flex items-center justify-between px-5 py-3 z-20"
        style={{ background: "rgba(10,10,20,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <button
          onClick={() => { endCall(); navigate("/home"); }}
          className="flex items-center gap-2 text-white/60 hover:text-white transition text-sm"
        >
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">Home</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <Video size={15} className="text-white" />
          </div>
          <span className="text-white font-semibold text-sm tracking-wide">RandomCall</span>
          {isInCall && (
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              {formatDuration(callDuration)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-white/50">
          <Globe size={13} className="text-emerald-400" />
          <span className="text-emerald-400 font-medium">{onlineCount.toLocaleString()}</span>
          <span>online</span>
        </div>
      </header>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex relative overflow-hidden">

        {/* ════ IDLE / ENDED STATE ════ */}
        {(callState === STATES.IDLE || callState === STATES.ENDED) && (
          <div className="flex-1 flex items-center justify-center">
            {/* Ambient blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-fuchsia-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-8 text-center px-6">
              {/* Icon ring */}
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-linear-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-2xl shadow-violet-900/50">
                  <Video size={48} className="text-white" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-violet-400/30 animate-ping" />
              </div>

              <div>
                <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
                  {callState === STATES.ENDED ? "Call Ended" : "Video Chat"}
                </h1>
                <p className="text-white/50 max-w-xs text-sm leading-relaxed">
                  {callState === STATES.ENDED
                    ? "Want to meet someone new?"
                    : "Start a random video call and meet someone from anywhere in the world."}
                </p>
              </div>

              <button
                onClick={findStranger}
                className="group relative px-10 py-4 rounded-2xl font-bold text-white text-base overflow-hidden shadow-xl shadow-violet-900/40 transition hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)" }}
              >
                <span className="relative z-10 flex items-center gap-3">
                  <Video size={20} />
                  {callState === STATES.ENDED ? "Find New Stranger" : "Start Video Call"}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ════ SEARCHING STATE ════ */}
        {callState === STATES.SEARCHING && (
          <div className="flex-1 flex items-center justify-center">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl animate-pulse" />
            </div>
            <div className="relative z-10 flex flex-col items-center gap-6 text-center">
              {/* Spinner rings */}
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 rounded-full border-4 border-violet-500/20" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-400 animate-spin" />
                <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-fuchsia-400 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="text-violet-300" size={28} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Finding someone...</h2>
                <p className="text-white/50 text-sm">Scanning the globe ✨</p>
              </div>
              <button
                onClick={() => { socketRef.current?.emit("skipVideoPartner"); setCallState(STATES.IDLE); }}
                className="px-6 py-2.5 rounded-xl text-white/60 hover:text-white border border-white/10 hover:border-white/30 text-sm transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ════ IN-CALL STATE ════ */}
        {isInCall && (
          <div className="flex-1 flex relative">

            {/* ── REMOTE VIDEO (full) ── */}
            <div className="flex-1 relative bg-gray-900">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover transition-opacity duration-500 ${hasRemoteStream ? "opacity-100" : "opacity-0"}`}
              />

              {/* Connecting overlay */}
              {!hasRemoteStream && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-white/10 border-t-violet-400 animate-spin" />
                    <div className="absolute inset-3 rounded-full bg-violet-500/20 flex items-center justify-center">
                      <Video className="text-violet-300" size={22} />
                    </div>
                  </div>
                  <p className="text-white/60 text-sm">Connecting...</p>
                </div>
              )}

              {/* Partner muted video placeholder */}
              {hasRemoteStream && !partnerVideo && (
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
                      <CameraOff className="text-white/40" size={32} />
                    </div>
                    <p className="text-white/40 text-sm">Camera off</p>
                  </div>
                </div>
              )}

              {/* Partner indicators */}
              {hasRemoteStream && (
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  {!partnerAudio && (
                    <div className="flex items-center gap-1.5 bg-red-500/80 backdrop-blur px-3 py-1.5 rounded-full text-white text-xs">
                      <MicOff size={12} />
                      <span>Muted</span>
                    </div>
                  )}
                </div>
              )}

              {/* Duration badge */}
              {hasRemoteStream && (
                <div className="absolute top-4 right-4">
                  <span className="bg-black/50 backdrop-blur text-white/80 text-xs font-mono px-3 py-1.5 rounded-full border border-white/10">
                    {formatDuration(callDuration)}
                  </span>
                </div>
              )}
            </div>

            {/* ── LOCAL VIDEO (PiP) ── */}
            <div
              className="absolute bottom-24 right-4 w-36 h-48 sm:w-44 sm:h-60 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-10 bg-gray-800"
              style={{ boxShadow: "0 0 40px rgba(124,58,237,0.3)" }}
            >
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${videoEnabled ? "opacity-100" : "opacity-0"}`}
              />
              {!videoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <CameraOff className="text-white/30" size={24} />
                </div>
              )}
              {/* You label */}
              <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                <span className="bg-black/50 text-white/70 text-xs px-2 py-0.5 rounded-full">You</span>
              </div>
            </div>

            {/* ── CHAT PANEL ── */}
            {showChat && (
              <div
                className="absolute right-0 top-0 bottom-0 w-80 flex flex-col z-20"
                style={{ background: "rgba(10,10,20,0.92)", backdropFilter: "blur(16px)", borderLeft: "1px solid rgba(255,255,255,0.08)" }}
              >
                {/* Chat header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <span className="text-white font-medium text-sm">Chat</span>
                  <button onClick={() => setShowChat(false)} className="text-white/40 hover:text-white transition">
                    <X size={16} />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
                  {messages.map((msg) => {
                    if (msg.type === "system") {
                      return (
                        <div key={msg.id} className="text-center">
                          <span className="text-white/30 text-xs bg-white/5 px-3 py-1 rounded-full">{msg.text}</span>
                        </div>
                      );
                    }
                    const isMe = msg.type === "me";
                    return (
                      <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                            isMe
                              ? "bg-violet-600 text-white rounded-br-sm"
                              : "bg-white/10 text-white/90 rounded-bl-sm"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                  {partnerTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white/10 px-3 py-2 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                        {[0, 150, 300].map((d) => (
                          <span key={d} className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat input */}
                <div className="flex items-center gap-2 p-3 border-t border-white/10">
                  <input
                    type="text"
                    placeholder="Message..."
                    value={chatInput}
                    onChange={handleChatTyping}
                    onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                    className="flex-1 bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-violet-500/60"
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={!chatInput.trim()}
                    className="w-8 h-8 bg-violet-600 hover:bg-violet-500 rounded-xl flex items-center justify-center disabled:opacity-40 transition"
                  >
                    <Send size={14} className="text-white" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════ CONTROL BAR (in-call) ════ */}
        {isInCall && (
          <div
            className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-4 py-4 z-10"
            style={{ background: "linear-gradient(to top, rgba(5,5,15,0.95), transparent)" }}
          >
            {/* Toggle audio */}
            <ControlBtn
              onClick={toggleAudio}
              active={!audioEnabled}
              activeColor="bg-red-500 hover:bg-red-600"
              defaultColor="bg-white/15 hover:bg-white/25"
              title={audioEnabled ? "Mute" : "Unmute"}
            >
              {audioEnabled ? <Mic size={20} className="text-white" /> : <MicOff size={20} className="text-white" />}
            </ControlBtn>

            {/* Toggle video */}
            <ControlBtn
              onClick={toggleVideo}
              active={!videoEnabled}
              activeColor="bg-red-500 hover:bg-red-600"
              defaultColor="bg-white/15 hover:bg-white/25"
              title={videoEnabled ? "Stop camera" : "Start camera"}
            >
              {videoEnabled ? <Camera size={20} className="text-white" /> : <CameraOff size={20} className="text-white" />}
            </ControlBtn>

            {/* Chat toggle */}
            <ControlBtn
              onClick={() => setShowChat((s) => !s)}
              active={showChat}
              activeColor="bg-violet-600 hover:bg-violet-700"
              defaultColor="bg-white/15 hover:bg-white/25"
              title="Chat"
            >
              <div className="relative">
                <MessageSquare size={20} className="text-white" />
                {unreadCount > 0 && !showChat && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-fuchsia-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </div>
            </ControlBtn>

            {/* Skip */}
            <ControlBtn
              onClick={skipStranger}
              activeColor="bg-amber-500 hover:bg-amber-600"
              defaultColor="bg-amber-500/80 hover:bg-amber-500"
              title="Skip"
            >
              <SkipForward size={20} className="text-white" />
            </ControlBtn>

            {/* End call */}
            <ControlBtn
              onClick={endCall}
              activeColor="bg-red-600 hover:bg-red-700"
              defaultColor="bg-red-600 hover:bg-red-700"
              title="End call"
              large
            >
              <PhoneOff size={22} className="text-white" />
            </ControlBtn>
          </div>
        )}
      </div>
    </div>
  );
}

// Small reusable control button
function ControlBtn({ children, onClick, active, activeColor, defaultColor, title, large }) {
  const size = large ? "w-16 h-16" : "w-12 h-12";
  const color = active ? activeColor : defaultColor;
  return (
    <button
      onClick={onClick}
      title={title}
      className={`${size} ${color} rounded-full flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 shadow-lg`}
    >
      {children}
    </button>
  );
}