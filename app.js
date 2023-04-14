const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
TaskdbURI = process.env.DBTASKURI;
UserdbURI = process.env.DBUSERURI;
port = process.env.PORT;
const cookieParser = require('cookie-parser');


app.use(cookieParser())



// userDBConnection.then(() => { console.log('Connected to UserDB') }).catch((err) => { console.log(err) });

mongoose.connect(TaskdbURI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    const taskRoutes = require('./routes/taskroutes')();
    const userRoutes = require('./routes/userRoutes')();
    app.use('/tasks', taskRoutes);
    app.use('/users', userRoutes)
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

