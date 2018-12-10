'use strict';

const mongoose = require('mongoose');

const wordtypeSchema = mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    word: {type: String, required: true},
    wordType: {type: String, required: true},
    target: {type: String },
    answer: {type: String }

});

wordtypeSchema.pre('find', function(next) {
    this.populate('user', '-username -password -__v');
    next();
});

wordtypeSchema.pre('findOne', function(next) {
    this.populate('user', '-username -password -__v');
    next();
});

const WordObject = mongoose.model('WordObject', wordtypeSchema);

module.exports = {WordObject};