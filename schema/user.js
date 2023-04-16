const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    Password: {
        type: String,
        required: true
    },
    ActualPassword: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true
    },
    ID: {
        type: String,
        required: true
    }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

module.exports = User; 