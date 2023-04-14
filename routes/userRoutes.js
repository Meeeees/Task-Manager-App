const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Userrouter = express.Router();
const User = require('../schema/user.js');
const jwt = require('jsonwebtoken');
const secret = process.env.SECRET;
const nodeMailer = require('nodemailer');
require('dotenv').config();
const cookie = require('cookie-parser');
Userrouter.use(cookie());


const transporter = nodeMailer.createTransport({
    host: 'smtp.ziggo.nl',
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
    }
});

module.exports = () => {
    Userrouter.get('/', (req, res) => {
        User.find()
            .then(result => { res.render('view-users', { users: result }); console.log(result) })
            .catch(err => console.log(err));
    })
    Userrouter.get('/signin', (req, res) => {
        res.render('signin');
    })

    Userrouter.get('/signup', (req, res) => {
        res.render('signup');
    })

    Userrouter.post('/sendVerificationEmail', (req, res) => {
        const Email = req.body.email;
        const Password = req.body.password;
        const ID = uuidv4();
        const token = jwt.sign({ email: Email, password: Password, id: ID }, secret, { expiresIn: '30m' });
        // add the token to the cookies
        res.cookie('jwt', token, { httpOnly: true, maxAge: 1000 * 60 * 30 });
        console.log(Email)
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: Email,
            subject: 'Verification Email',
            text: `Please click on the link to verify your email: http://localhost:3000/users/verify/${token}`
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

    Userrouter.post('/Verifyuser', (req, res) => {
        const Email = req.body.email;
        const Password = req.body.password;
        User.find({ Email: Email, Password: Password })
            .then(result => {
                console.log(result)
                if (result.length === 0) {
                    res.send('<p>Invalid Credentials</p>');
                }
                else {
                    const token = jwt.sign({ Email: Email, Password: Password, id: result[0].ID }, secret, { expiresIn: '30m' });
                    res.cookie('jwt', token, { httpOnly: true, maxAge: 1000 * 60 * 30 });
                    res.redirect('/tasks');
                }
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
                    ID: decoded.id
                })
                user.save()
                const Token = jwt.sign({ used: true }, secret, { expiresIn: '30m' })
                res.cookie('usedToken', Token, { httpOnly: true, maxAge: 1000 * 60 * 30 });
                res.redirect('/tasks');
            }
        })
    })

    return Userrouter;
};
