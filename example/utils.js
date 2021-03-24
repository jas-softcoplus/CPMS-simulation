const StationModel = require('./model/Station');
const OperatorIdModel = require('./model/OperatorId');
const TransectionModel = require('./model/Transection');


const verifyPassword = async (identity, password) => {
    try {
        const station = await StationModel.findOne({ identity });

        if (!!!station) {
            console.log('Station Not found ' + identity);
            return false;
        }

        if (station.password !== password) {
            console.log('Wrong Password');
            return false
        }

        console.log('Password Matched');
        return true;

    } catch (err) {
        console.log(err);
    }
}


const findStation = async (identity) => {
    try {
        const station = await StationModel.findOne({ identity }).lean();
        return station;
    } catch (err) {
        console.log(err);
    }
}


const findOperatorById =  async (id) => {
    try {
        const operator = await OperatorIdModel.findById(id);
        return operator;
    } catch (err) {
        console.log(err);
    }
}


const findOperatorByStationId = async (identity) => {
    try {

        const station = await StationModel.findOne({ identity }).lean();
        if (!!!station) { throw 'Station not found'; }

        const operator = await OperatorIdModel.findById(station.operatorId);
        return operator;

    } catch (err) {
        console.log(err);
    }
}


const addStartTransection = async  (data) => {
    try {
        await TransectionModel.create(data)
    } catch (err) {
        console.log(err);
    }
}

const stopTransection = async (data, transactionId) => {
    try {
        await TransectionModel.findOneAndUpdate({ response: { transactionId } }, { $set: { stoped: data } });
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}




module.exports = { verifyPassword, findOperatorByStationId, findStation, findOperatorById, addStartTransection, stopTransection };
