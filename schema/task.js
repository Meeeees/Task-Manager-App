const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const taskSchema = new Schema({
    Goal: {
        type: String,
        required: true
    },
    Requirements: {
        type: String,
        required: true
    },
    Deadline: {
        type: Date,
        required: true
    },
    Started: {
        type: Boolean,
    },
    Completed: {
        type: Boolean,
    },
    UserID: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task; 