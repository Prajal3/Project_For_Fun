import {Server} from "socket.io"
import {v4 as uuidv4} from "uuid"

export let io;

const onlineUsers = new Map();
const userSockets = new Map();
const activeCalls = new Map();

const allowedOrigins = [
  'http://localhost:5173',
];