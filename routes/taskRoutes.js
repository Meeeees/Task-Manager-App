const express = require('express');
const Taskrouter = express.Router();
const Task = require('../schema/task.js');

module.exports = () => {
    Taskrouter.get('/', (req, res) => {
        Task.find().sort({ 'Deadline': 1 })
            .then(result => { res.render('view-tasks', { tasks: result }); console.log(result) })
            .catch(err => console.log(err));

    });

    Taskrouter.get('/create', (req, res) => {
        res.render('create-task');
    });

    Taskrouter.get('/edit', (req, res) => {
        Task.find()
            .then(result => res.render('edit-tasks', { tasks: result }))
            .catch(err => console.log(err));
    });

    Taskrouter.post('/create-task', (req, res) => {
        const task = new Task(req.body);
        task.save()
            .then(result => res.redirect('/tasks'))
            .catch(err => console.log(err));
    });

    Taskrouter.post('/edit-task/:id', (req, res) => {
        id = req.params.id;
        Task.findById(id)
            .then(result => {
                result.Goal = req.body.Goal;
                result.Requirements = req.body.Requirements;
                result.Deadline = req.body.Deadline;
                result.save()
                    .then(result => res.redirect('/tasks'))
                    .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
    });

    Taskrouter.delete('/delete-task/:id', (req, res) => {
        Task.findByIdAndDelete(req.params.id, (err, docs) => {
            if (err) {
                console.log(err);
            }
            else {
                res.redirect('/tasks');
            }
        })
    })


    return Taskrouter;
};