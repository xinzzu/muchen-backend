const mongoose = require('mongoose')

const TokenSchema= new mongoose.Schema({
   token: String

});

const TokenModel = mongoose.model("Token", TokenSchema)
module.exports = TokenModel
