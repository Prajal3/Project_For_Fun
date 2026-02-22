import { Server } from "socket.io";

export let io;

// Track online users: userId -> socketId
const onlineUsers = new Map();
// Track socket -> userId
const socketToUser = new Map();

// Separate queues for text and video
const textWaitingQueue = [];
const videoWaitingQueue = [];

// Active pairs (shared): socketId -> partnerSocketId
const activePairs = new Map();

const allowedOrigins = ["http://localhost:5173"];

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // ─── REGISTER USER ───────────────────────────────────────────────
    socket.on("register", (userId) => {
      onlineUsers.set(userId, socket.id);
      socketToUser.set(socket.id, userId);
      io.emit("onlineCount", onlineUsers.size);
    });

    // ─── TEXT CHAT MATCHMAKING ────────────────────────────────────────
    socket.on("findPartner", () => {
      removeFromQueues(socket.id);
      if (activePairs.has(socket.id)) return;

      const partnerSocketId = dequeueAlive(textWaitingQueue);
      if (partnerSocketId) {
        const partnerSocket = io.sockets.sockets.get(partnerSocketId);
        pairSockets(socket, partnerSocket, "text");
      } else {
        textWaitingQueue.push(socket.id);
        socket.emit("searching");
      }
    });

    // ─── VIDEO CALL MATCHMAKING ───────────────────────────────────────
    socket.on("findVideoPartner", () => {
      removeFromQueues(socket.id);
      if (activePairs.has(socket.id)) return;

      const partnerSocketId = dequeueAlive(videoWaitingQueue);
      if (partnerSocketId) {
        const partnerSocket = io.sockets.sockets.get(partnerSocketId);
        pairSockets(socket, partnerSocket, "video");
      } else {
        videoWaitingQueue.push(socket.id);
        socket.emit("videoSearching");
      }
    });

    // ─── TEXT MESSAGES ────────────────────────────────────────────────
    socket.on("chatMessage", (data) => {
      const partnerSocket = getPartnerSocket(socket.id);
      if (partnerSocket) {
        partnerSocket.emit("chatMessage", {
          text: data.text,
          from: "stranger",
          timestamp: Date.now(),
        });
      }
    });

    socket.on("typing", (isTyping) => {
      const partnerSocket = getPartnerSocket(socket.id);
      if (partnerSocket) partnerSocket.emit("partnerTyping", isTyping);
    });

    // ─── WebRTC SIGNALING ─────────────────────────────────────────────
    socket.on("webrtc:offer", (data) => {
      const partnerSocket = getPartnerSocket(socket.id);
      if (partnerSocket) partnerSocket.emit("webrtc:offer", { sdp: data.sdp });
    });

    socket.on("webrtc:answer", (data) => {
      const partnerSocket = getPartnerSocket(socket.id);
      if (partnerSocket) partnerSocket.emit("webrtc:answer", { sdp: data.sdp });
    });

    socket.on("webrtc:ice", (data) => {
      const partnerSocket = getPartnerSocket(socket.id);
      if (partnerSocket) partnerSocket.emit("webrtc:ice", { candidate: data.candidate });
    });

    // ─── MEDIA STATE EVENTS ───────────────────────────────────────────
    socket.on("mediaState", (state) => {
      // state = { video: bool, audio: bool }
      const partnerSocket = getPartnerSocket(socket.id);
      if (partnerSocket) partnerSocket.emit("partnerMediaState", state);
    });

    // ─── SKIP / END ───────────────────────────────────────────────────
    socket.on("skipPartner", () => disconnectFromChat(socket));
    socket.on("skipVideoPartner", () => disconnectFromChat(socket));

    // ─── DISCONNECT ───────────────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
      const userId = socketToUser.get(socket.id);
      if (userId) {
        onlineUsers.delete(userId);
        socketToUser.delete(socket.id);
      }
      removeFromQueues(socket.id);
      disconnectFromChat(socket);
      io.emit("onlineCount", onlineUsers.size);
    });
  });

  return io;
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function pairSockets(socketA, socketB, mode) {
  activePairs.set(socketA.id, socketB.id);
  activePairs.set(socketB.id, socketA.id);

  if (mode === "video") {
    socketA.emit("videoPartnerFound", { isInitiator: true });
    socketB.emit("videoPartnerFound", { isInitiator: false });
  } else {
    socketA.emit("partnerFound", { isInitiator: true });
    socketB.emit("partnerFound", { isInitiator: false });
  }
}

function disconnectFromChat(socket) {
  const partnerSocketId = activePairs.get(socket.id);
  if (partnerSocketId) {
    activePairs.delete(socket.id);
    activePairs.delete(partnerSocketId);
    const partnerSocket = io.sockets.sockets.get(partnerSocketId);
    if (partnerSocket) partnerSocket.emit("partnerDisconnected");
  }
}

function getPartnerSocket(socketId) {
  const partnerSocketId = activePairs.get(socketId);
  if (!partnerSocketId) return null;
  return io.sockets.sockets.get(partnerSocketId) || null;
}

function removeFromQueues(socketId) {
  [textWaitingQueue, videoWaitingQueue].forEach((q) => {
    const idx = q.indexOf(socketId);
    if (idx !== -1) q.splice(idx, 1);
  });
}

function dequeueAlive(queue) {
  while (queue.length > 0) {
    const id = queue.shift();
    if (io.sockets.sockets.get(id)) return id;
  }
  return null;
}