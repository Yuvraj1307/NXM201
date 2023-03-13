const jwt = require("jsonwebtoken");
const fs = require("fs");
const auth = (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];
  if(!token){
    return res.send("please login")
  }
const blocked=fs.readFileSync("./blacklist.json","utf-8")
if(blocked.includes(token)){
    return res.send("please login again")
}

  jwt.verify(token, 'normal', function(err, decoded) {
    if(err){
       
        res.send("please login again")
        console.log(err.message)
    }else{
        req.role=decoded.role
        console.log(decoded)
        next()
    }
  });
};

module.exports = {
  auth,
};