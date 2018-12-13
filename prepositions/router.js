const express = require('express');
const { Preposition } = require('./models');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const passport = require('passport');
const jwtAuth = passport.authenticate('jwt', { session: false });

// GET PREPOSITIONS BY USER ID
router.get('/protected/user/:id', jwtAuth, (req, res) => {
    
    const findSentencesByUser = async () => {
        
        let sentences = await Preposition.find({ user: req.params.id }, '-__v');
        return res.json(sentences);

    };

    findSentencesByUser().catch(err => {
        console.error(err);
        res.status(500).json({message: "Internal server error, please try again later."})
    });

});

// CREATE A NEW PREPOSITION OBJECT
router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['user', 'sentence', 'answer'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if (missingField) {
        return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: 'Missing field',
        location: missingField
        });
    };

    const createPrepositionObject = async () => {
        let prepObj = await Preposition.create({
            user: req.body.user,
            sentence: req.body.sentence,
            answer: req.body.answer
        })
        return res.status(201).json(prepObj);
    }

    createPrepositionObject().catch(err => res.status(500).send({message: 'Internal server error. Please try again later.'}));

});

// DELETE A WORD OBJECT BY ID
router.delete('/:id', (req, res) => {

    const deletePreposition = async () => {
        let sentence = await Preposition.findOneAndDelete(req.params.id);
        console.log(`Deleted Word Object with id (${req.params.id})`);
        return res.status(204).end();
    };
    
    deletePreposition().catch(err => res.status(500).json({message: 'Internal server error.'}));

});

module.exports = router;