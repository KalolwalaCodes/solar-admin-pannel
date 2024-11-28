const express=require('express');
const path=require('path');
const cors=require('cors');
const app=express();
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
const {authenticateJWT} =require('./Controllers/auth.js')
// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies (form data)
app.use(express.urlencoded({ extended: true }));
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
app.use("/admin-panel/RevenueExpenseManager",authenticateJWT,RevenueExpenseManager);
app.use("/admin-panel/submit-form",authenticateJWT,formDataRouter);
app.use("/admin-panel/product-category",authenticateJWT,solarProductRouter);
app.use("/admin-panel/shareholder-value",authenticateJWT,shareHolderRouter);

app.listen("8000",()=>{
    console.log("server running on port 8000");
})