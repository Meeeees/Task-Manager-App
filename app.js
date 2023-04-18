const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const os = require('os');
const Task = require('./schema/task.js');
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


app.get("/add-emm", (req, res) => {
    const tasks = [
        {
            Goal: 'Plan a surprise birthday party for a friend',
            Requirements: 'Create a guest list, choose a venue, select decorations, order food and drinks, organize entertainment, and send out invitations.',
            Deadline: new Date('2023-05-15'),
            Started: false,
            Completed: false,
            UserID: '46d78aed-bc12-4cef-a7c9-c2e92d372f4f'
        },
        {
            Goal: 'Complete a 5k run for charity',
            Requirements: 'Register for the race, create a fundraising page, train regularly, find sponsors, and participate in the event.',
            Deadline: new Date('2023-05-21'),
            Started: false,
            Completed: false,
            UserID: '46d78aed-bc12-4cef-a7c9-c2e92d372f4f'
        },
        {
            Goal: 'Write a 10-page research paper',
            Requirements: 'Choose a topic, conduct research, create an outline, write the paper, edit and proofread, and submit by the deadline.',
            Deadline: new Date('2023-05-28'),
            Started: false,
            Completed: false,
            UserID: '46d78aed-bc12-4cef-a7c9-c2e92d372f4f'
        },
        {
            Goal: 'Clean out and organize your closet',
            Requirements: 'Take everything out of the closet, sort items into keep, donate, or discard piles, clean the closet space, organize items by category, and dispose of unwanted items.',
            Deadline: new Date('2023-05-31'),
            Started: false,
            Completed: false,
            UserID: '46d78aed-bc12-4cef-a7c9-c2e92d372f4f'
        },
        {
            Goal: 'Learn a new language',
            Requirements: 'Choose a language, enroll in a language course or use language learning software, practice regularly, and track progress.',
            Deadline: new Date('2023-05-31'),
            Started: false,
            Completed: false,
            UserID: '46d78aed-bc12-4cef-a7c9-c2e92d372f4f'
        }
    ];

    tasks.forEach((task) => {
        const newTask = new Task(task);
        newTask.save()
            .then(() => console.log('Task saved to database'))
            .catch((err) => console.error('Error saving task to database:', err));
    });
    res.send('Done');
});