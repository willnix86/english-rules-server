'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();

const { User } = require('../users/models');
const { Preposition } = require('../prepositions/models');
const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');
const { seeders } = require('./seeders');

const config = require('../config');
const jwt = require('jsonwebtoken');

chai.use(chaiHttp);

describe('Prepositions API Resource', function() {

    before(function() {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function() {
        const userData = seeders.seedSixUsers();
        return Promise.all(
            [
                User.insertMany(userData),
                seeders.generateAndSeedPrepositionsData(userData)
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

        it('should get all prepositions by user ID', async function() {
            let token;
            let user = await User.findOne();
            token = jwt.sign({user}, config.JWT_SECRET, {
                    subject: user.username,
                    expiresIn: config.JWT_EXPIRY,
                    algorithm: 'HS256'
                    });
            let res = await chai.request(app)
                .get(`/prepositions/protected/user/${user._id}`)
                .set('Authorization', `Bearer ${token}`);

            res.should.have.status(200);
            res.body.should.have.lengthOf.at.least(1);
            res.body.forEach(preposition => {
                preposition.user._id.should.equal("" + user._id);
            }); 

        });

    });

// POST ENDPOINTS
    describe('POST endpoints', function() {

        it('should add a new preposition', async function() {
            const newPreposition = {
                user: '5bbfbe91f60377afff6decb2',
                sentence: 'I heard a loud noise in the sky, so I looked _____ in the air and was surprised!',
                answer: 'up'
            };

            let res = await chai.request(app)
                            .post('/prepositions')
                            .send(newPreposition);

            res.should.have.status(201);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.include.keys('user', 'sentence', 'answer');
            res.body.sentence.should.equal(newPreposition.sentence);
            res.body.answer.should.equal(newPreposition.answer);

            let prepObj = await Preposition.findById(res.body._id);
            prepObj.sentence.should.equal(prepObj.sentence);
            prepObj.answer.should.equal(prepObj.answer);
            newPreposition.user.should.equal("" + prepObj.user._id);
        });

    });

// DELETE ENDPOINTS
    describe('DELETE endpoints', function() {
        it('should remove correct preposition from database', async function() {
            let id;
            let preposition = await Preposition.findOne();
            id = preposition._id;
            
            let res = await chai.request(app)
                .delete(`/prepositions/${id}`);

            res.should.have.status(204);

        });
    });

});