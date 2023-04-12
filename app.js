const express = require('express');
const app = express();
const Task = require('./schema/task');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodeMailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const secret = process.env.SECRET;
dburi = process.env.DBURI;



const transporter = nodeMailer.createTransport({
    host: 'smtp.ziggo.nl',
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
    }
});


mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => app.listen(3000, () => console.log("server online")))
    .catch(err => console.log(err))

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/create', (req, res) => {
    res.render('create-task');
});

app.delete('/delete-task/:id', (req, res) => {
    Task.findByIdAndDelete(req.params.id, (err, docs) => {
        if (err) {
            console.log(err);
        }
        else {
            res.redirect('/tasks');
        }
    })

})

app.get('/tasks', (req, res) => {
    Task.find().sort({ 'Deadline': 1 })
        .then(result => res.render('view-tasks', { tasks: result }))
        .catch(err => console.log(err));
});

app.get('/edit', (req, res) => {
    Task.find()
        .then(result => res.render('edit-tasks', { tasks: result }))
        .catch(err => console.log(err));
});

app.get('/signin', (req, res) => {
    res.render('signin');
})


app.post('/create-task', (req, res) => {
    const task = new Task(req.body);
    task.save()
        .then(result => res.redirect('/tasks'))
        .catch(err => console.log(err));
});

app.post('/edit-task/:id', (req, res) => {
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
})

app.post('/sendVerificationEmail', (req, res) => {
    const email = req.body.email;
    const token = jwt.sign({ email: email }, secret, { expiresIn: '10m' });
    console.log(email)
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Verification Email',
        text: `Please click on the link to verify your email: http://localhost:3000/verify/${token}`
    }
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log('Email sent: ' + info.response);
        }
    })
})

app.get('/verify/:token', (req, res) => {
    const token = req.params.token;
    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log(decoded);
            res.redirect('/tasks');
        }
    })
})