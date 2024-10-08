const express = require('express');
const app = express();
const path = require('path');
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors');

const PORT = process.env.PORT || 3500;

app.use(logger);

const whitelist = ['https://www.yoursite.com', 'http://127.0.0.1:5500', 'http://localhost:3500'];

const corsOptions = {
    origin: (origin, callback) => {
        if ( whitelist.indexOf(origin) !== -1 || !origin ) {
            callback(null, true); 
        } else {
            callback(new Error('not allowed by the CORS'));
        }
    },
    optionsSuccessStatus: 200 // I  forgot this😂
}

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));
//===================so in the new versions of express================//
// we no longer need to use these type of additional middlewares which serve static files
// the app.use(express.static(path.join(__dirname, 'public'))) will look for each and sub-directories as long as that have a linked static files that are present in 'public' folder  
//app.use('/subdir', express.static(path.join(__dirname, 'public'))); // we no longer need this❌
//////////////////////////////////////////////////////
//===========[1] handling subdir with router===========//
// app.use('/route', require('./routes/router'));
app.use('/subdir', require('./routes/subdir'));
//===========[2] handling root ('/') with router==========//
//👉👉now in the new version of express we can use regX in app.use('/*'), app.ues('^/$');👈👈
app.use('/', require('./routes/root'));
// still need to create root.js in the routes let's do that
//============[3] let's see how we can set up an API an REST API if you say==============//
//let's create a router for employees
app.use('/employees', require('./routes/api/employees'));
// we still need to create this api folder and employees.js let's do that***




/////////////////////////////////////////////////////
app.all('/*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ error: '404 not found'});
    } else {
        res.type('txt').send('404 not found');
    }
})

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`server is running on port: ${PORT}`);
})