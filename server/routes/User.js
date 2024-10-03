const express=require("express");
const router=express.Router();
router.get('/', (req, res) => {
    res.send("hello user")
    
  })
  .get('/new', (req, res) => {
    res.send("hello user new")
    
  })
  .get('/new/:id', (req, res) => {
    console.log("the new id is ",req.params.id,req.params);
    res.send(`hello user new${req.params.id}`);
  });
  module.exports=router;