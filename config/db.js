const mongoose = require('mongoose');
const config = require('config');

const db = config.get('mongoURI');

const mongoConnect = async () => {
    try {
        await mongoose.connect(db , {
            useNewUrlParser: true,
            useCreateIndex:true,
            useUnifiedTopology: true
        });
        console.log('connected to db')
    }catch(err) {
        console.log(err.code);
        process.exit(1);
    }
}

module.exports = mongoConnect;