const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: String,
    RFID: [{
        idTag: String,
        parentIdTag: String,
        blocked: Boolean,
        expires: Date
    }]
});


module.exports = mongoose.model('operators', schema);
