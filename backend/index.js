const express = require("express");
const app = express();
const cors = require("cors");

const connectDB = require("./config/db");

app.use(express.json());
require("dotenv").config();

app.use(cors());

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

// Define Routes
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/mining", require("./routes/miningRoutes"));
app.use("/api/concentration", require("./routes/concentrationRoutes"));
app.use("/api/smelting", require("./routes/smeltingRoutes"));
app.use("/api/fabrication", require("./routes/fabricationRoutes"));
app.use("/api/use-phase", require("./routes/usePhaseRoutes"));
app.use("/api/end-of-life", require("./routes/endOfLifeRoutes"));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
