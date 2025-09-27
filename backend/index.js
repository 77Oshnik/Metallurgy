const express = require("express");
const app = express();
const cors = require("cors");

const connectDB = require("./config/db");

app.use(express.json());
require("dotenv").config();

const allowedOrigins = [
  "https://metallurgy-q8bv.vercel.app", // your Vercel frontend
  "http://localhost:3000"              // local dev
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true // allow cookies/auth headers
}));

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'LCA Platform API is running',
    timestamp: new Date().toISOString()
  });
});

// Define Routes
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/mining", require("./routes/miningRoutes"));
app.use("/api/concentration", require("./routes/concentrationRoutes"));
app.use("/api/smelting", require("./routes/smeltingRoutes"));
app.use("/api/fabrication", require("./routes/fabricationRoutes"));
app.use("/api/use-phase", require("./routes/usePhaseRoutes"));
app.use("/api/end-of-life", require("./routes/endOfLifeRoutes"));
app.use('/api/comparison', require('./routes/comparisonRoutes'));
app.use('/api/whatif', require('./routes/whatifRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));
app.use('/api/energy-transition', require('./routes/energyTransitionRoutes'));
app.use('/api/harmful-effects', require('./routes/harmfulEffectsRoutes'));
app.use('/api/valorization', require('./routes/valorizationRoutes'));


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});