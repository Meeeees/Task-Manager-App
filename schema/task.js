const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const taskSchema = new Schema({
    Goal: {
        type: String,
        required: true
    },
    Requirements: {
        type: Array,
        required: true
    },
    Deadline: {
        type: Date,
        required: true
    },
    ToDo: {
        type: Boolean,
        default: true,
        required: true
    },
    Doing: {
        type: Boolean,
        default: false,
        required: true
    },
    Finished: {
        type: Boolean,
        default: false,
        required: true
    },
    UserID: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task; 