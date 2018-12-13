const express = require('express');
const { WordObject } = require('./models');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const passport = require('passport');
const jwtAuth = passport.authenticate('jwt', { session: false });

// GET WORD OBJECTS BY USER ID
router.get('/protected/user/:id', jwtAuth, (req, res) => {
    
    const findWordsByUser = async () => {
        
        let words = await WordObject.find({ user: req.params.id }, '-__v');
        return res.json(words);

    };

    findWordsByUser().catch(err => {
        console.error(err);
        res.status(500).json({message: "Internal server error, please try again later."})
    });

});

// CREATE A NEW WORD OBJECT
router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['user', 'word', 'wordType'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if (missingField) {
        return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: 'Missing field',
        location: missingField
        });
    };

    const createWordObject = async () => {
        let wordObj = await WordObject.create({
            user: req.body.user,
            word: req.body.word,
            wordType: req.body.wordType,
            target: 'Container',
            answer: ''
        })
        return res.status(201).json(wordObj);
    }

    createWordObject().catch(err => res.status(500).send({message: 'Internal server error. Please try again later.'}));

});

// DELETE A WORD OBJECT BY ID
router.delete('/:id', (req, res) => {

    const deleteWordObject = async () => {
        let word = await WordObject.findOneAndDelete(req.params.id);
        console.log(`Deleted Word Object with id (${req.params.id})`);
        return res.status(204).end();
    };
    
    deleteWordObject().catch(err => res.status(500).json({message: 'Internal server error.'}));

});

module.exports = router;