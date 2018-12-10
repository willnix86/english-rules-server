'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();

const { User } = require('../users/models');
const { WordObject } = require('../wordtypes/models');
const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');
const { seeders } = require('./seeders');

const config = require('../config');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

chai.use(chaiHttp);

describe('WordTypes API Resource', function() {

    before(function() {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function() {
        const userData = seeders.seedSixUsers();
        return Promise.all(
            [
                User.insertMany(userData),
                seeders.generateAndSeedWordsData(userData)
            ]
        );
    });

    afterEach(function() {
        return seeders.tearDownDb();
    });

    after(function() {
        return closeServer();
    });

// GET ENDPOINT
    describe('Generic GET endpoints', function() {

        it('should get all word objects by user ID', async function() {
            let token;
            let user = await User.findOne();
            token = jwt.sign({user}, config.JWT_SECRET, {
                    subject: user.username,
                    expiresIn: config.JWT_EXPIRY,
                    algorithm: 'HS256'
                    });
            let res = await chai.request(app)
                .get(`/wordtypes/protected/userId/${user._id}`)
                .set('Authorization', `Bearer ${token}`);

            res.should.have.status(200);
            res.body.should.have.lengthOf.at.least(1);
            res.body.forEach(word => {
                word.user._id.should.equal("" + user._id);
            }); 

        });

    });

// POST ENDPOINTS
    describe('POST endpoints', function() {

        it('should add a new word', async function() {
            const newWord = {
                user: '5bbfbe91f60377afff6decb2',
                word: 'fish',
                wordType: 'Nouns'
            };

            let res = await chai.request(app)
                            .post('/wordtypes')
                            .send(newWord);

            res.should.have.status(201);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.include.keys('user', 'word', 'wordType', 'target', 'answer');
            res.body.word.should.equal(newWord.word);
            res.body.wordType.should.equal(newWord.wordType);

            let wordObj = await WordObject.findById(res.body._id);
            wordObj.word.should.equal(newWord.word);
            wordObj.wordType.should.equal(newWord.wordType);
            newWord.user.should.equal("" + wordObj.user._id);
        });

    });

// DELETE ENDPOINTS
    describe('DELETE endpoints', function() {
        it('should remove correct word from database', async function() {
            let id;
            let word = await WordObject.findOne();
            id = word._id;
            
            let res = await chai.request(app)
                .delete(`/wordtypes/${id}`);

            res.should.have.status(204);

        });
    });

});