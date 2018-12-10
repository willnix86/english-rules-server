const express = require('express');
const { User } = require('./models');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const passport = require('passport');

const jwtAuth = passport.authenticate('jwt', {session: false });

// CREATE A NEW USER
router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['username', 'password'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if (missingField) {
        return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: 'Missing field',
        location: missingField
        });
    }

    const stringFields = ['username', 'password', 'firstName', 'lastName'];
    const nonStringField = stringFields.find(
        field => field in req.body && typeof req.body[field] !== 'string'
    );

    if (nonStringField) {
        return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: 'Incorrect field type: expected string',
        location: nonStringField
        });
    }

    const explicityTrimmedFields = ['username', 'password'];
    const nonTrimmedField = explicityTrimmedFields.find(
        field => req.body[field].trim() !== req.body[field]
    );

    if (nonTrimmedField) {
        return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: 'Cannot start or end with whitespace',
        location: nonTrimmedField
        });
    }

    const sizedFields = {
        username: {
        min: 1
        },
        password: {
        min: 8,
        max: 72
        }
    };
    const tooSmallField = Object.keys(sizedFields).find(
        field =>
        'min' in sizedFields[field] &&
                req.body[field].trim().length < sizedFields[field].min
    );
    const tooLargeField = Object.keys(sizedFields).find(
        field =>
        'max' in sizedFields[field] &&
                req.body[field].trim().length > sizedFields[field].max
    );

    if (tooSmallField || tooLargeField) {
        return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: tooSmallField
            ? `Must be at least ${sizedFields[tooSmallField]
            .min} characters long`
            : `Must be at most ${sizedFields[tooLargeField]
            .max} characters long`,
        location: tooSmallField || tooLargeField
        });
    }

    let {username, password, firstName = '', lastName = ''} = req.body;
    firstName = firstName.trim();
    lastName = lastName.trim();

    const createUser = async () => {
        let count = await User.find({username}).countDocuments()
        if (count > 0) {
            return Promise.reject({
            code: 422,
            reason: 'ValidationError',
            message: 'Username already taken',
            location: 'username'
            });
        }
        let hash = await User.hashPassword(password);
        let user = await User.create({username,
            password: hash,
            firstName,
            lastName
        })
        return res.status(201).json(user.serialize());
    };

    createUser().catch(err => {
        if (err.reason === 'ValidationError') {
            return res.status(err.code).json(err);
        }
        res.status(500).json({code: 500, message: 'Internal server error'});
    });

});

//GET A USER BY ID
router.get('/protected/:id', jwtAuth, (req, res) => {
    const findUserById = async () => {
        let user = await User.findOne(
            { _id: req.params.id }, '-__v'
        );
        return res.json(user.serialize());
    }
    
    findUserById().catch(err => {
        console.error(err);
        res.status(500).json({message: "Internal server error, please try again later."})
    });
});

// EDIT A USER BY ID
router.put('/:id', jsonParser, (req, res) => {
    if (!(req.params.id && req.body.id === req.body.id)) {
        let message = 'Request path id and request body id values must match';
        console.error(message);
        res.status(400).send(message);
    }

    const updated = {};
    const updatableFields = ['firstName', 'lastName', 'password'];

    updatableFields.forEach(field => {
        if (field in req.body) {
            updated[field] = req.body[field];
        }
    });

    const updateUser = async () => {
        let updatedUser = await User.findOneAndUpdate(
            {_id: req.params.id},
            {$set: updated},
            {new: true}
        );

        return res.status(204).end();
    }

    updateUser().catch(err => res.status(500).json({message: 'Something went wrong.'}));
});

// DELETE A USER BY ID (AND REMOVE ASSOCIATED GAMES ALONG WITH IT)
router.delete('/:id', (req, res) => {

    let deleteUser = async () => {
        //add in games to delete
        let user = await User.findByIdAndRemove(req.params.id);
        console.log(`Deleted user with id (${req.params.id})`);
        return res.status(204).end();
    }

    deleteUser().catch(err => res.status(500).json({message: 'Internal server error.'}));

});

module.exports = router;



