const express = require('express');
const route = express.Router();
const {check , validationResult } = require('express-validator');
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
//@route get /api/users
//access public
// register user
route.post('/' , 
[
    check('name' , 'Please enter a valid name').not().isEmpty(),
    check('email' , 'Please enter a valid email').isEmail(),
    check('password' , 'Enter a valid password').isLength({ min: 6 })
] , 
async (req , res) => {
    const errors = validationResult(res);
    if(!errors.isEmpty()) { 
        return res.status(400).json({ error: errors.array() }) 
    }
    const {email , name , password} = req.body;
    try {
    //check if user exist
    let user =await User.findOne({ email });
    if(user) {
        return res.status(400).json({ err: [ { msg: 'User Already exists' } ] });
    }
    
    //get user gravatar
    const avatar = gravatar.url(email , {
        s: '200',
        r: 'pg',
        d: 'mm'
    });

    user = new User({
        name: name,
        email: email,
        password: password,
        avatar: avatar
    });
    console.log(user)
    //encrypt password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password , salt);

    await user.save();

    //return jsonwebtoken
    const payload = {
        user: {
            id: user.id
        }
    }

    jwt.sign(payload , config.get('jwtSecretToken'), {
        expiresIn: 360000
    }, (err , token) => {
        if(err) throw err;
        res.send({ token });
    });


    } catch(err) {
        console.log(err)
        res.status(500).send("Something went wrong");
    }
});

module.exports = route;