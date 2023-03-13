const mongoose = require("mongoose");
const productschema = mongoose.Schema({
  name: String,
  qty: Number,
  price: Number,
});

const prodmodel = mongoose.model("products", productschema);

module.exports = {
  prodmodel,
};
