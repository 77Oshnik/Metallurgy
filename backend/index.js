const express=require('express');
const app=express();
app.use(express.json());
require('dotenv').config();

const PORT=process.env.PORT;


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});