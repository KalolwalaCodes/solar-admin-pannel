const express=require('express');
const path=require('path');
const cors=require('cors');
const app=express();
const userRouter=require("./routes/User.js");
const investorRouter=require("./routes/Investor.js");
const contactRouter=require('./routes/Contact.js');
const sustainabilityRouter = require('./routes/Sustainability.js');
app.use(express.json());
app.use(cors({origin:"*"}))
app.use("/Investor-relation",investorRouter);
app.use("/Sustainability",sustainabilityRouter);
app.use("/contactRouter",contactRouter)

app.listen("8000",()=>{
    console.log("server running on port 8000");
})