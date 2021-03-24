const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    identity: String,
    password: String,
    operatorId: String
});


module.exports = mongoose.model('stations', schema);
