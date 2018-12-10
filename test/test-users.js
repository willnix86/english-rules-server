'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();

const { User } = require('../users/models');
const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');
const { seeders } = require('./seeders');

const config = require('../config');
const jwt = require('jsonwebtoken');

chai.use(chaiHttp);

function postUserRequest(newUser) {
    return chai.request(app)
    .post('/users')
    .send(newUser)
};

function findUser(userId) {
    return User.findById(userId);
};

describe('Users API Resource', function() {
    
    before(function() {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function() {
        const userData = seeders.seedUserData();
        return User.insertMany(userData)
    });

    afterEach(function() {
        return seeders.tearDownDb();
    });

    after(function() {
        return closeServer();
    });

    // GET ENDPOINT
    describe('GET endpoints', function() {

        // GET USER BY ID
        it('should return the correct user from database', async function() {
            let id;
            let token;
            let user = await User.findOne();
            id = user._id;

            token = jwt.sign({user}, config.JWT_SECRET, {
                subject: user.username,
                expiresIn: config.JWT_EXPIRY,
                algorithm: 'HS256'
            });

            let res = await chai.request(app)
                .get(`/users/protected/${id}`)
                .set('Authorization', `Bearer ${token}`); 

            res.should.have.status(200);
            res.body.id.should.equal(id.toString());
            res.body.should.be.a('object');
            res.body.should.include.keys('id', 'firstName', 'lastName', 'username');
        });

        it('should return user with all the right fields', async function() {
            let id;
            let token;
            let res;
            let resUser;
            let user = await User.findOne();
            id = user._id;
            token = jwt.sign({user}, config.JWT_SECRET, {
                subject: user.username,
                expiresIn: config.JWT_EXPIRY,
                algorithm: 'HS256'
                });
            res = await chai.request(app)
                .get(`/users/protected/${id}`)
                .set('Authorization', `Bearer ${token}`)
            resUser = res.body;
            resUser.id.should.equal(res.body.id);
            resUser.firstName.should.equal(res.body.firstName);
            resUser.lastName.should.equal(res.body.lastName);
            resUser.username.should.equal(res.body.username);
        });

    });

    // POST ENDPOINTs
    describe('POST endpoints', function() {

        // POST NEW USER
        it('should add a new user', async function() {
            const newUser = seeders.generateUserData();
            let res = await postUserRequest(newUser);
                res.should.have.status(201);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.include.keys('id', 'firstName', 'lastName', 'username');
                res.body.username.should.equal(newUser.username);
                res.body.id.should.not.be.null;
            let user = await findUser(res.body.id)
                user.firstName.should.equal(newUser.firstName);
                user.lastName.should.equal(newUser.lastName);
                user.username.should.equal(newUser.username);
        });

    });

    // PUT ENDPOINTS
    describe('PUT endpoints', function() {
        it('should update users in the database', async function() {
            const updateData = seeders.generateUserUpdateData();
            let id;
            let token;
            let user = await User.findOne();
            id = user._id;
            token = jwt.sign({user}, config.JWT_SECRET, {
                subject: user.username,
                expiresIn: config.JWT_EXPIRY,
                algorithm: 'HS256'
                });

            let userToUpdate = await chai.request(app)
                .get(`/users/protected/${id}`)
                .set('Authorization', `Bearer ${token}`);
                updateData.id = userToUpdate.body.id

            let res = await chai.request(app)
                .put(`/users/${updateData.id}`)
                .send(updateData);
                
            res.should.have.status(204);

            user = await User.findById(updateData.id);
            user.lastName.should.equal(updateData.lastName);

            });
    });

    // DELETE ENDPOINTS
    describe('DELETE endpoints', function() {
        it('should remove correct user from database', async function() {
            let id;
            let token;
            let user = await User.findOne()
            id = user.id;
            token = jwt.sign({user}, config.JWT_SECRET, {
                subject: user.username,
                expiresIn: config.JWT_EXPIRY,
                algorithm: 'HS256'
                });

            let res = await chai.request(app)
                .get(`/users/protected/${id}`)
                .set('Authorization', `Bearer ${token}`);

            user = res.body.id;

            res = await chai.request(app)
                .delete(`/users/${user}`);

            res.should.have.status(204);

            res = await chai.request(app)
                .get(`/users/protected/${id}`)
                .set('Authorization', `Bearer ${token}`);

            res.should.have.status(500);

            res = await chai.request(app)
                .get(`/people/user/${user}`);

            res.should.have.status(404);

        });
    });

});