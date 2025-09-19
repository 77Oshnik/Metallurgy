const express=require('express');
const app=express();
const connectDB = require('./config/db');

app.use(express.json());
require('dotenv').config();

// Connect to Database
connectDB();

const PORT=process.env.PORT || 5000;

// Define Routes
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/mining', require('./routes/miningRoutes'));


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});