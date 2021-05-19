const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose=require("mongoose");

mongoose.connect("mongodb://localhost:27017/bankDB",{useNewUrlParser: true,useUnifiedTopology:true});

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



 const cusomerSchema = {
  name: String,
  email: String,
  balance:Number,
  gender:String,
  acno:Number
 };
 const transactionSchema = {
  sendname: String,
  recvname: String,
  amt:Number,
  dttime:String
 };
 const Customer = mongoose.model("Customer", cusomerSchema);
 const Transaction=mongoose.model("Transaction", transactionSchema);
  
app.get("/",function(req,res){
  res.render("home");
});

app.get("/details",function(req,res){
  Customer.find({}, function(err, customers){
   res.render("details", {
     customers: customers
     });
   })
});

app.get("/about",function(req,res){
  res.render("about");
});

app.get("/customers/:custID", function(req, res){
  const requestedcustID = req.params.custID;
  Customer.findOne({_id:requestedcustID},function(err,customer){
    res.render("more", {
           name: customer.name,
           email: customer.email,
           balance: customer.balance,
           gender: customer.gender,
           acno: customer.acno
    });
  });
});

app.get("/transaction",function(req,res){
  Customer.find({}, function(err, customers){
   res.render("transaction", {
     customers: customers
     });
   })
});
let sendname="";
let recvname="";
let amt="";
app.post("/transaction", function(req, res){
   sendname=req.body.sendname;
   recvname=req.body.recvname;
   amt=req.body.amt;
  if(sendname==="Select" || recvname==="Select" || sendname===recvname ){
    res.redirect("/transaction");
  }
  else{
    var newDate = new Date();
    var datetime =new Date().toLocaleString();;
  const trans= new Transaction ({
    sendname: sendname,
    recvname: recvname,
    amt: amt,
    dttime:datetime
    });
    trans.save();
  Customer.updateOne({name:sendname},{$inc:{balance: -amt}},function(err){
    if(!err){
      Customer.updateOne({name:recvname},{$inc:{balance: amt}},function(err){
        if(!err){

          res.redirect("/success");

        }
      })
    }
  })
}
});

app.get("/trns-hist",function(req,res){
  Transaction.find({}, function(err, transactions){
   res.render("trns-hist", {
     transactions: transactions
     });
   })
});

app.get("/success",function(req,res){
  res.render("success",{
   send:sendname,
   recv:recvname,
    amount:amt
  });
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
