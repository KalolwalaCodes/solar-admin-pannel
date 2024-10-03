const express=require('express');
const path=require('path');
const cors=require('cors');
const app=express();
const userRouter=require("./routes/User.js");
const investorRouter=require("./routes/Investor.js");
const sustainabilityRouter = require('./routes/Sustainability.js');
app.use(express.json());
app.use(cors({origin:"http://localhost:5173"}))
app.use("/Investor-relation",investorRouter);
app.use("/Sustainability",sustainabilityRouter);


app.listen("8000",()=>{
    console.log("server running on port 8000");
})