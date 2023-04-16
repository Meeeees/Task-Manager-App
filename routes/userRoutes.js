const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Userrouter = express.Router();
const User = require('../schema/user.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const secret = process.env.SECRET;
const nodeMailer = require('nodemailer');
const cookie = require('cookie-parser');
const os = require('os');
require('dotenv').config();
Userrouter.use(cookie());
let ipadres;
const interfaces = os.networkInterfaces();
for (let interfaceName in interfaces) {
    const interfaceInfo = interfaces[interfaceName];

    for (let i = 0; i < interfaceInfo.length; i++) {
        const info = interfaceInfo[i];
        if (info.family === 'IPv4' && !info.internal) {
            ipadres = info.address;
        }
    }
}
const saltrounds = 10;


const transporter = nodeMailer.createTransport({
    host: 'smtp.ziggo.nl',
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
    }
});

module.exports = (loggedIn) => {
    Userrouter.get('/', (req, res) => {
        User.find()
            .then(result => { res.render('view-users', { users: result, loggedIn: loggedIn }); console.log("/ :", result) })
            .catch(err => console.log(err));
    })
    Userrouter.get('/signin', (req, res) => {
        res.render('signin', { loggedIn: loggedIn });
    })

    Userrouter.get('/signup', (req, res) => {
        res.render('signup', { loggedIn: loggedIn });
    })

    Userrouter.get('/incorrectLogin', (req, res) => {
        res.render('incorrect-login', { loggedIn: loggedIn });
    })

    Userrouter.get('/Emailsent', (req, res) => {
        res.render('Emailsent', { loggedIn: loggedIn });
    })

    Userrouter.post("/sendresetpass", (req, res) => {
        const Email = req.body.email;
        const password = req.body.password;
        const token = jwt.sign({ email: Email, password: password }, secret, { expiresIn: '30m' });

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: Email,
            subject: 'Reset Password',
            text: `Please click on the link to reset your password: http://${ipadres}:3000/users/resetpass/${token}`
        }
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err);
            }
            else {
                console.log('Email sent: ' + info.response);
                res.send('<p>Verification email sent</p>')
            }
        })

    })

    Userrouter.get('/resetpass/:token', (req, res) => {
        const token = req.params.token;
        jwt.verify(token, secret, async (err, decoded) => {
            if (err) {
                console.log(err);
                res.status(400).send('Invalid Token');
            }
            else {
                console.log("reset: ", decoded);
                const Email = decoded.email;
                const Password = decoded.password;
                let user = await User.findOne({ Email: Email })
                user.Password = bcrypt.hashSync(Password, saltrounds);
                user.ActualPassword = Password;
                user.save().then
                    (result => {
                        console.log("resetresult: ", result);
                    })
                res.redirect('/users/signin');

            }
        })
    })

    Userrouter.get('/checkemailexists/:email', (req, res) => {
        const Email = req.params.email;
        User.find({ Email: Email })
            .then(result => {
                let exists = false;
                if (result.length > 0) {
                    exists = true;
                }
                exists = JSON.stringify(exists);
                res.send(exists);
            })
    })

    Userrouter.post('/sendVerificationEmail', (req, res) => {
        const Email = req.body.Email;

        // check if email already exists
        User.find({ Email: Email })
            .then(result => {
                if (result.length > 0) {
                    res.send("<p>Email already exists</p><small>PS: Don't delete properties</small><br>");
                    return;
                } else {
                    let Password = req.body.Password;
                    const actualPassword = req.body.Password;
                    Password = bcrypt.hashSync(Password, saltrounds);
                    const ID = uuidv4();
                    const token = jwt.sign({ email: Email, password: Password, actualPassword: actualPassword, id: ID }, secret, { expiresIn: '30m' });
                    // add the token to the cookies
                    res.cookie('jwt', token, { httpOnly: true, maxAge: 1000 * 60 * 30 });
                    console.log(Email)
                    const mailOptions = {
                        from: process.env.GMAIL_USER,
                        to: Email,
                        subject: 'Verification Email',
                        text: `Please click on the link to verify your email: http://${ipadres}:3000/users/verify/${token}`
                    }
                    transporter.sendMail(mailOptions, (err, info) => {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log('Email sent: ' + info.response);
                            res.send('<p>Verification email sent</p>')
                        }
                    })
                }
            })
    })

    Userrouter.post('/Verifyuser', (req, res) => {
        const Email = req.body.email;
        const Password = req.body.password;
        User.find({ Email: Email })
            .then(result => {
                if (result.length === 0) {
                    res.redirect('/users/incorrectLogin');
                    return;
                }
                for (let i = 0; i < result.length; i++) {
                    if (bcrypt.compareSync(Password, result[i].Password)) {
                        const token = jwt.sign({ Email: Email, Password: Password, id: result[i].ID }, secret, { expiresIn: '30m' });
                        res.cookie('jwt', token, { httpOnly: true, maxAge: 1000 * 60 * 30 });
                        res.redirect('/tasks');
                        return;
                    }
                }
                res.redirect('/users/incorrectLogin');

            })
    })

    Userrouter.get('/verify/:token', (req, res) => {
        if (req.cookies.usedToken) {
            res.redirect('/tasks');
            return;
        }
        const token = req.params.token;
        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                console.log(err);
                res.status(400).send('Invalid Token');
            }
            else {
                console.log(decoded);
                const user = new User({
                    Email: decoded.email,
                    Password: decoded.password,
                    ActualPassword: decoded.actualPassword,
                    ID: decoded.id
                })
                console.log("pre: ", user);
                user.save()
                    .then(result => {
                        console.log("worked", result);
                    }).catch(err => console.log(err));
                const Token = jwt.sign({ used: true }, secret, { expiresIn: '30m' })
                res.cookie('usedToken', Token, { httpOnly: true, maxAge: 1000 * 60 * 30 });
                res.redirect('/tasks');
            }
        })
    })

    return Userrouter;
};
