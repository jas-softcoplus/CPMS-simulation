const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    stationIdentity: String,
    connectorId: Number,
    idTag: String,
    meterStart: mongoose.Schema.Types.Mixed,
    timestamp: mongoose.Schema.Types.Mixed,
    response: {
        idTagInfo: {
            status: String,
            parentIdTag: String,
            expires: Date
        },
        transactionId: String
    },
    stoped: {
        timestamp: mongoose.Schema.Types.Mixed,
        meterStop: mongoose.Schema.Types.Mixed
    }
});


module.exports = mongoose.model('transections', schema);
