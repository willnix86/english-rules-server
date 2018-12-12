'use strict';
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');

const {PORT, CLIENT_ORIGIN, DATABASE_URL } = require('./config');
const userRouter = require('./users/router');
const authRouter = require('./auth/router');
const wordtypesRouter = require('./wordtypes/router');
const prepositionsRouter = require('./prepositions/router');
const { localStrategy, jwtStrategy } = require('./auth/strategies');

const app = express();
mongoose.Promise = global.Promise;

app.use(morgan("common"));

var corsOptions = {
    origin: CLIENT_ORIGIN,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    optionsSuccessStatus: 200,
}

app.options('*', cors(corsOptions))
app.use(cors(corsOptions));

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/users', userRouter);
app.use('/auth', authRouter);
app.use('/wordtypes', wordtypesRouter);
app.use('/prepositions', prepositionsRouter);

app.use('*', (req, res) => {
    return res.status(404).json({message: 'Not Found'});
});

let server;

function runServer(databaseURL, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(
            databaseURL,
            { useNewUrlParser: true },
            err => {
                if (err) {
                    return reject(err);
                }
                server = app
                .listen(port, () => {
                    console.log(`Your app is listening on port ${port}`);
                    resolve();
                })
                .on('error', err=> {
                    mongoose.disconnect();
                    reject(err);
                });
            }
        );
    });
}

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.log(err));
}

module.exports = { app, runServer, closeServer };