const mongoose = require("mongoose");
const userschema = mongoose.Schema({
  name: String,
  mail: String,
  pass: String,
  role:{
    type:String,
    enum:["customer","seller"],
    default:"customer"
  }
});

const usermodel = mongoose.model("user", userschema);
module.exports = {
  usermodel,
};
