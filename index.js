const express = require("express");
const { connection } = require("./config/db");
const { usermodel } = require("./model/usermodel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { prodmodel } = require("./model/productmodel");
const { auth } = require("./middleware/auth");
const { authorise } = require("./middleware/authorise");
const mongoose = require("mongoose");
const fs = require("fs");

const app = express();
app.use(express.json());
require("dotenv").config();
app.get("/", (req, res) => {
  res.send("hello");
});

app.post("/signup", async (req, res) => {
  let { name, mail, pass, role } = req.body;
  try {
    bcrypt.hash(pass, 5, async (err, hash) => {
      // Store hash in your password DB.
      let user = await usermodel({ name, mail, pass: hash, role });
      await user.save();
      res.status(200).send("user added");
      console.log(user);
    });
  } catch (err) {
    res.status(404).send("cant add user ");
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  let { mail, pass } = req.body;
  try {
    let user = await usermodel.findOne({ mail });
    if (!user) {
      res.status(404).send("signup first");
    }
    let hash = user.pass;
    bcrypt.compare(pass, hash, async (err, result) => {
      if (result == true) {
        let token = jwt.sign({ userid: user._id, role: user.role }, process.env.normal, {
          expiresIn: 60,
        });
        let refreshtoken = jwt.sign({ userid: user._id }, process.env.refresh, {
          expiresIn: 300,
        });
        res.status(200).send({ msg: "login success", token, refreshtoken });
      }
    });
  } catch (err) {
    res.status(404).send("cant login");
    console.log(err);
  }
});

app.get("/logout", (req, res) => {
  let token = req.headers.authorization?.split(" ")[1];
  const blacklistdata = JSON.parse(
    fs.readFileSync("./blacklist.json", "utf-8")
  );
  blacklistdata.push(token);
  fs.writeFileSync("./blacklist.json", JSON.stringify(blacklistdata));
  res.send("user is logged out");
});

app.get("/gettoken",(req,res)=>{
    const refreshtoken=req.headers.authorization?.split(" ")[1]
    if(!refreshtoken){res.send("login again")}
    jwt.verify(refreshtoken, 'refresh', function(err, decoded) {
         var token = jwt.sign({ userid: decoded.userid,role:decoded.role }, process.env.normal,{
            expiresIn: 60,
          });
             res.send({msg:"token generated",token,refreshtoken})
      });
});

app.get("/products", auth, async (req, res) => {
  try {
    let data = await prodmodel.find();
    console.log(data);
    res.status(200).send(data);
  } catch (err) {
    res.status(404).send("cant show products")
    console.log(err)
  }
 
});

app.post("/addproducts", auth, authorise(["seller"]), async (req, res) => {
  let data = req.body;
  try {
    let product = await prodmodel(data);
    await product.save();
    res.status(200).send("product is added");
    console.log(product);
  } catch (err) {
    res.status(404).send("can't add product");
    console.log(err);
  }
});

app.delete(
  "/deleteproducts/:id",
  auth,
  authorise(["seller"]),
  async (req, res) => {
    let id = req.params.id;

    try {
      let prod = await prodmodel.findByIdAndRemove({ _id: id });
      console.log(prod);
      res.status(200).send("deleted");
    } catch (err) {
      res.status(404).send("cant delete");
      console.log(err);
    }
  }
);

app.listen(process.env.port, async () => {
  try {
    await connection;
    console.log(`connected to Db ${process.env.port}`);
  } catch (err) {
    console.log(err);
  }
});
