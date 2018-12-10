const mongoose = require('mongoose');
const faker = require('faker');
const { WordObject } = require('../wordtypes/models');

const seeders = {

    tearDownDb: function() {
        console.log('Deleting database...');
        return mongoose.connection.dropDatabase();
    },

// SEEDERS FOR USER TESTS

    seedUserData: function() {
        console.log('Seeding user data...');
        const seedData = [];
        for (let i = 0; i < 10; i++) {
            seedData.push(seeders.generateUserData());
        };
        return seedData;
    },

    generateUserData: function() {
        return {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            username: `${faker.name.firstName()}.${faker.name.lastName()}`,
            password: faker.internet.password()
        }
    },

    generateUserUpdateData: function() {
        return {
            lastName: faker.name.lastName(),
            password: faker.internet.password()
        }
    },

// SEEDERS FOR WORDTYPES

    seedSixUsers: function() {
        console.log('Seeding six users\' data...');
        const userData = [];
        for (let i = 0; i < 6; i++) {
            userData.push(seeders.generateSixUsers(i));
        };
        return userData;
    },

    generateSixUsers: function(index) {
        return {
            _id: `5bbfbe91f60377afff6decb${index}`,
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            username: `${faker.name.firstName()}.${faker.name.lastName()}`,
            password: faker.internet.password()
        }
    },

    generateAndSeedWordsData: function(users) {

        const seedData = [];

        for (let i = 0; i < 6; i++) {
            let wordObj;

            if (i === 0 || i === 3 ) {
                wordObj = {
                    user: users[i]._id,
                    word: faker.hacker.noun(),
                    wordType: 'Nouns',
                    target: 'Container',
                    answer: ' '
                }
            }
            else if (i === 1 || i === 4) {
                wordObj = {
                    user: users[i]._id,
                    word: faker.hacker.adjective(),
                    wordType: 'Adjectives',
                    target: 'Container',
                    answer: ' '
                }
            }
            else if (i === 2 || i === 5) {
                wordObj = {
                    user: users[i]._id,
                    word: faker.hacker.verb(),
                    wordType: 'Verbs',
                    target: 'Container',
                    answer: ' '
                }
            }

        seedData.push(wordObj);

        }
        
        console.log('Seeding six Words\' data...');
        return WordObject.insertMany(seedData);
    
    }

};

module.exports = { seeders };