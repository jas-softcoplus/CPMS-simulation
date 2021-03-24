const WebSocket = require('ws');
const { isPast } = require('date-fns');
const { v4 } = require('uuid');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
var bodyParser = require('body-parser')
const transectionModel = require('./model/Transection');

const utils = require('./utils');

const wss = new WebSocket.Server({ port: 8080 }, ['ocpp1.6']);
const app = express();


app.use(cors());
app.use(bodyParser.json());



try {
    mongoose.connect('mongodb+srv://jassa:jassa@cluster0.xcw3a.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useNewUrlParser: true });
    console.log('Connected to databse')
} catch (err) {
    console.log(err);
}



const stopTransection = [];

wss.on('connection', async (ws, req) => {

    console.log('connnected');

    const password = req.headers['Authorization'].split('Basic')[0];
    const isAuth = await utils.verifyPassword(req.url, password);
    if (!isAuth) { ws.close(); return; }



    ws.on('upgrade', (request) => { console.log('upgrage'); console.log(request); });
    ws.on('open', () => { console.log('open In') });


    const station = await utils.findStation(req.url);
    if (!!!station) { ws.close(); return; }

    const operator = await utils.findOperatorById(station.operatorId);
    if (!!!operator) { ws.close(); return; }



    ws.on('message', (data) => {
        console.log(data);

        data = JSON.parse(data);
        const [messageType, messageId, action, payload] = data;



        switch (action) {
            case 'Authorize': {

                const tagData = operator.RFID.find(item => item.idTag === payload.idTag);
                if (!!!tagData) return ws.send(JSON.stringify([messageType, messageId, { idTagInfo: { status: 'Invalid' } }]))
                if (tagData.blocked) return ws.send(JSON.stringify([messageType, messageId, { idTagInfo: { status: 'Blocked' } }]))
                if (isPast(tagData.expires)) return ws.send(JSON.stringify([messageType, messageId, { idTagInfo: { status: 'Expired' } }]))

                ws.send(JSON.stringify([messageType, messageId, { idTagInfo: { status: 'Accepted', parentIdTag: tagData.parentIdTag, expiryDate: tagData.expires } }]))
                break;
            }



            case 'startTransaction': {
                const transection = JSON.parse(payload);
                const response = { ...transection };

                transection.transactionId = v4();
                const tagData = operator.RFID.find(item => item.idTag === payload.idTag);

                response.response = { transectionId: transection.transactionId };

                if (!!!tagData) {
                    response.response = { idTagInfo: { status: 'Invalid' }, transactionId: transection.transactionId };
                    utils.addStartTransection(response);
                    return ws.send(JSON.stringify([messageType, messageId, { idTagInfo: { status: 'Invalid' }, transactionId: transection.transactionId }]))
                }

                if (tagData.blocked) {
                    response.response = { idTagInfo: { status: 'Blocked' }, transactionId: transection.transactionId };
                    utils.addStartTransection(response);
                    return ws.send(JSON.stringify([messageType, messageId, { idTagInfo: { status: 'Blocked' }, transactionId: transection.transactionId }]))
                }

                if (isPast(tagData.expires)) {
                    response.response = { idTagInfo: { status: 'Expired' }, transactionId: transection.transactionId };
                    utils.addStartTransection(response);
                    return ws.send(JSON.stringify([messageType, messageId, { idTagInfo: { status: 'Expired' }, transactionId: transection.transactionId }]))
                }

                response.response = { idTagInfo: { status: 'Accepted', parentIdTag: tagData.parentIdTag, expiryDate: tagData.expires }, transactionId: transection.transactionId };
                utils.addStartTransection(response);

                ws.send(JSON.stringify([messageType, messageId, { idTagInfo: { status: 'Accepted', parentIdTag: tagData.parentIdTag, expiryDate: tagData.expires }, transactionId: transection.transactionId }]))
                break;
            }


            case 'stopTransection': {
                const transection = JSON.parse(payload);
                stopTransection.push(transection);

                const isDone = utils.stopTransection({ timestamp: transection.timestamp, meterStop: transection.meterStop }, transection.transactionId);

                if (!isDone) console.log('Something Went Wrong stoping transection - database ');

                ws.send(JSON.stringify([messageType, messageId, {}]))
            }

            default:
                console.log(data);
                break;
        }

    });

    ws.on('ping', (data) => {
        console.log('ping')
        console.log(data)
    });

    ws.on('pong', (data) => {
        console.log('pong')
        console.log(data);

    });

    ws.on('close', (code, reason) => {
        console.log('Close');
        console.log(code, reason);
    })

    ws.on('error', (err) => {
        console.log('err');
        console.log(err);
    })

});


wss.on('error', (err) => {
    console.log('error');
    console.log(err)
})



app.post('/changeProfile', async (req, res, next) => {
    try {

        const { transectionId } = req.body;

        const transection = await transectionModel.findOne({ 'response.transactionId': transectionId }).lean();
        if (!!!transection) return res.status(400).json({ message: 'Transection Not Found' });

        

    } catch (err) {
        console.log(err);
    }
})



wss.on('close', function close() {
    console.log('out Close');
});