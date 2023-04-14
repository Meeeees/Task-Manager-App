const express = require('express');
const app = express();
const Task = require('./schema/task');
const User = require('./schema/user');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodeMailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const secret = process.env.SECRET;
TaskdbURI = process.env.DBTASKURI;
UserdbURI = process.env.DBUSERURI;
port = process.env.PORT;


const transporter = nodeMailer.createTransport({
    host: 'smtp.ziggo.nl',
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
    }
});

// userDBConnection.then(() => { console.log('Connected to UserDB') }).catch((err) => { console.log(err) });

mongoose.connect(TaskdbURI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    const taskRoutes = require('./routes/taskroutes')();
    app.use('/tasks', taskRoutes);
    // check connection to DB
    console.log(mongoose.connection.readyState)
    app.listen(port, () => {
        console.log(`Server is running on  localhost:${port}`);
    });
}).catch((err) => {
    console.log(err);
});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.render('index');
});



app.get('/signin', (req, res) => {
    res.render('signin');
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
            res.status(400).send('Invalid Token');
        }
        else {
            console.log(decoded);
            res.redirect('/tasks');
        }
    })
})