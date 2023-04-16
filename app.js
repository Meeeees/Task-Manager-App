const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const os = require('os');
require('dotenv').config();
secret = process.env.SECRET;
TaskdbURI = process.env.DBTASKURI;
UserdbURI = process.env.DBUSERURI;
port = process.env.PORT;
const cookieParser = require('cookie-parser');
app.use(cookieParser())

const interfaces = os.networkInterfaces();
let ipadres;
for (let interfaceName in interfaces) {
    const interfaceInfo = interfaces[interfaceName];

    for (let i = 0; i < interfaceInfo.length; i++) {
        const info = interfaceInfo[i];
        if (info.family === 'IPv4' && !info.internal) {
            ipadres = info.address;
        }
    }
}

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
let loggedIn = false;
app.use((req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                console.log(err);
                res.status(400).send('Invalid Token');
                next();
            } else {
                loggedIn = true;
                next();
            }
        })
    } else {
        loggedIn = false;
        next();
    }
});
mongoose.connect(TaskdbURI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    const taskRoutes = require('./routes/taskroutes')();
    const userRoutes = require('./routes/userRoutes')(loggedIn);
    app.use('/tasks', taskRoutes);
    app.use('/users', userRoutes)
    // check connection to DB
    console.log(mongoose.connection.readyState)
    app.use((req, res) => {
        res.status(404).render('404');
    });
    app.listen(port, () => {
        console.log(`Server is running on  ${ipadres}:${port}`);
    });
}).catch((err) => {
    console.log(err);
});

app.get('/', (req, res) => {
    res.render('index', { loggedIn: loggedIn });
});


app.get('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.redirect('/');
});
