const express = require('express');
const Taskrouter = express.Router();
const Task = require('../schema/task.js');
const secret = process.env.SECRET;
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

Taskrouter.use(cookieParser());

module.exports = () => {
    let id;
    Taskrouter.use((req, res, next) => {
        const token = req.cookies.jwt;
        if (token) {
            jwt.verify(token, secret, (err, decoded) => {
                if (err) {
                    console.log(err);
                    res.status(400).send('Invalid Token');
                    return;
                }
                else {
                    console.log("tasks: ", decoded);
                    id = decoded.id;
                    next();
                }
            })
        } else {
            res.redirect('/users/signup');
        }
    })

    Taskrouter.get('/', (req, res) => {
        Task.find({ UserID: id }).sort({ 'Deadline': 1 })
            .then(result => { res.render('view-tasks', { tasks: result }); })
            .catch(err => console.log(err));

    });

    Taskrouter.get('/create', (req, res) => {
        res.render('create-task');
    });

    Taskrouter.get('/edit', (req, res) => {
        Task.find({ UserID: id })
            .then(result => res.render('edit-tasks', { tasks: result }))
            .catch(err => console.log(err));
    });

    Taskrouter.post('/state/:id', (req, res) => {
        id = req.params.id;
        ToState = req.body.state;
        Task.findById(id)
            .then(result => {
                if (ToState == 'ToDo') {
                    result.ToDo = true;
                    result.Doing = false;
                    result.Finished = false;
                }
                else if (ToState == 'Doing') {
                    result.ToDo = false;
                    result.Doing = true;
                    result.Finished = false;
                }
                else if (ToState == 'Finished') {
                    result.ToDo = false;
                    result.Doing = false;
                    result.Finished = true;
                }
                result.save()
                    .then(result => res.redirect('/tasks'))
                    .catch(err => console.log(err));
            })
    })



    Taskrouter.post('/create-task', (req, res) => {
        const token = req.cookies.jwt;
        let id;
        // verify jwt
        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                console.log(err);
                res.status(400).send('Invalid Token');
                return;
            }
            else {
                console.log(decoded);
                id = decoded.id;
            }
        })
        const task = new Task({
            Goal: req.body.Goal,
            Requirements: req.body.Requirements,
            Deadline: req.body.Deadline,
            UserID: id
        });
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
}