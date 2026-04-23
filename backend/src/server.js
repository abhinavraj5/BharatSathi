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

// ✅ FIXED CORS
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(helmet());
app.use(express.json({ limit: '10mb' }));

// ✅ FIXED RATE LIMIT
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
});
app.use('/api/auth', limiter);

// Routes
app.get('/', (req, res) => res.json({ status: 'API running' }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/experts', expertRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/crops', cropRoutes);

// Socket
const io = new Server(server, {
  cors: { origin: "http://localhost:5173" }
});
setupSignaling(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));