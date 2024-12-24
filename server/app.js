const express=require('express');
const path=require('path');
const cors=require('cors');
const app=express();
const bodyParser = require('body-parser');
const userRouter=require("./routes/User.js");
const investorRouter=require("./routes/Investor.js");
const contactRouter=require('./routes/Contact.js');
const sustainabilityRouter = require('./routes/Sustainability.js');
const loginRouter = require('./routes/User.js');
const newsRouter = require('./routes/News.js');
const bodRouter = require('./routes/boardsprofile.js');
const committeesRouter = require('./routes/Committies.js');
const RevenueExpenseManager = require('./routes/RevenueExpenseManager.js');
const formDataRouter = require('./Controllers/Formhelper.js');
const solarProductRouter = require('./routes/mainProducts.js');
const shareHolderRouter = require('./routes/Shareholder.js');
const sequencingRouter = require('./routes/sequencingdata.js');
const {authenticateJWT} =require('./Controllers/auth.js')
// Middleware to parse JSON bodies
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.json({ limit: '50mb' })); // For JSON payloads
app.use(express.urlencoded({ limit: '50mb', extended: true })); // For URL-encoded payloads
app.use(cors({ origin: [
    'http://localhost:5173', 
    'https://solargroup.com', 
    'http://127.0.0.1:5500'
  ],credentials: true,}))
app.use("/admin-panel/Investor-relation",investorRouter);
app.use("/admin-panel/Sustainability",sustainabilityRouter);
app.use("/admin-panel/contact-us",authenticateJWT,contactRouter)
app.use("/admin-panel/login",loginRouter);
app.use("/admin-panel/news",authenticateJWT,newsRouter);
app.use("/admin-panel/committees",authenticateJWT,committeesRouter);
app.use("/admin-panel/directors",authenticateJWT,bodRouter);
app.use("/admin-panel/RevenueExpenseManager",RevenueExpenseManager);
app.use("/admin-panel/submit-form",formDataRouter);
app.use("/admin-panel/product-category",solarProductRouter);
app.use("/admin-panel/shareholder-value",shareHolderRouter);
app.use("/admin-panel/sequencing",sequencingRouter);

app.listen("8000",()=>{
    console.log("server running on port 8000");
})