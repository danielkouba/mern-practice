const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
const gravatar = require("gravatar");
const bcrypt = require('bcryptjs');
const User = require('../../models/User');

// @route  POST api/users
// @desc   Register user
// @access Public
router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please make a password that is six or more characters').isLength({ min: 6 }),
],
async (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()});
    }
    console.log(req.body);

    const { name, email, password } = req.body;

    try {
        // See if user exists
        let user = await User.findOne({ email });
        // If the user exists send back an error 
        if(user) {
            return res
                .status(400)
                .json({errors : [ { msg : 'User already exists' }]})
        };
        //Get users Gravatar
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        });

        user = new User({
            name,
            email,
            avatar,
            password
        })

        //Encrypt password with bcrypt
        const salt = await bcrypt.genSalt(10)

        user.password = await bcrypt.hash(password, salt);

        await user.save();

        //Return jsonwebtoken
        res.send('User registered');
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }


    
})

module.exports = router;