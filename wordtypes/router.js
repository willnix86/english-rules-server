const express = require('express');
const { WordObject } = require('./models');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const passport = require('passport');
const jwtAuth = passport.authenticate('jwt', { session: false });

// GET WORD OBJECTS BY USER ID
router.get('/protected/userId/:id', jwtAuth, (req, res) => {
    
    const findWordsByUser = async () => {
        
        let words = WordObject.find({$and: [ {user: req.params.id} ]}, '-__v');

        return res.json(words);

    };

    findWordsByUser().catch(err => {
        console.error(err);
        res.status(500).json({message: "Internal server error, please try again later."})
    });

});

// CREATE A NEW WORD OBJECT
router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['user', 'word', 'wordType', 'target', 'answer'];
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

// EDIT A MEETING BY ID
router.put('/:id', jsonParser, (req, res) => {

    if (!(req.params.id && req.body.id === req.body.id)) {
        let message = 'Request path id and request body id must match';
        console.error(message);
        res.status(400).send(message);
    }

    let updated = {};
    const updatableFields = ['host', 'person', 'date'];

    updatableFields.forEach(field => {
        if (field in req.body) {
            updated[field] = req.body[field];
        }
    });

    Meeting.findOneAndUpdate(
        {_id: req.params.id},
        {$set: updated},
        {new: true}
    )
    .then(updatedMeeting => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Something went wrong.'}))
})

// DELETE A MEETING BY ID
router.delete('/:id', (req, res) => {
    Meeting.findByIdAndRemove(req.params.id)
    .then(() => {
        console.log(`Deleted meeting with id (${req.params.id})`);
        res.status(204).end();
        })
    .catch(err => res.status(500).json({message: 'Internal server error.'}));
});


module.exports = router;