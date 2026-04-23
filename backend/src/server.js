require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const expertRoutes = require('./routes/experts');
const callRoutes = require('./routes/calls');
const aiRoutes = require('./routes/ai');
const schemeRoutes = require('./routes/schemes');
const cropRoutes = require('./routes/crops');
const setupSignaling = require('./sockets/signaling');

const app = express();
const server = http.createServer(app);

// 🔥 SECURITY + CORS (ALLOW ALL DEVICES)
app.use(helmet());

app.use(cors({
  origin: "*",          // ✅ allow any device (important)
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  credentials: false
}));

app.use(express.json({ limit: '10mb' }));

// 🔥 RATE LIMIT (only for auth)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
});
app.use('/api/auth', limiter);

// 🔥 ROUTES
app.get('/', (req, res) => {
  res.json({ status: 'Rural Expert API running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/experts', expertRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/crops', cropRoutes);

// 🔥 TURN / STUN CONFIG
app.get('/api/turn-credentials', (req, res) => {
  res.json({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      {
        urls: 'turn:a.relay.metered.ca:80',
        username: process.env.METERED_TURN_USERNAME,
        credential: process.env.METERED_TURN_CREDENTIAL
      },
      {
        urls: 'turn:a.relay.metered.ca:443',
        username: process.env.METERED_TURN_USERNAME,
        credential: process.env.METERED_TURN_CREDENTIAL
      }
    ]
  });
});

// 🔥 SOCKET.IO (ALLOW ALL ORIGINS)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// 🔥 SIGNALING LOGIC
setupSignaling(io);

// 🔥 IMPORTANT: LISTEN ON ALL NETWORKS
const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});