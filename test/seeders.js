const mongoose = require('mongoose');
const faker = require('faker');

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
            // _id: mongoose.Types.ObjectId(),
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
    }

};

module.exports = { seeders };