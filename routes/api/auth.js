const express = require('express');
const route = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check , validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
//@route get /api/auth
//access public
route.get('/' ,  auth , async (req , res) => {
    try {
        const user = await User.findOne({_id: req.user.id}).select('-password');
        res.json(user);
    }catch(err) {
        console.log(err.message);
        res.status(401).send('Server error');
    }
});


route.post('/' , 
[
    check('email' , 'Invalid Credentials').isEmail(),
    check('password' , 'Invalid Credentials').isEmpty()
] , 
async (req , res) => {
    const errors = validationResult(res);
    if(!errors.isEmpty()) { 
        return res.status(400).json({ error: errors.array() }) 
    }
    const {email , password} = req.body;
    try {
    //check if user exist
    let user =await User.findOne({ email });
    if(!user) {
        return res.status(400).json({ err: [ { msg: 'Invalid Credentials' } ] });
    }

    const isMatch = bcrypt.compare(password , user.password);
    
    if(!isMatch) {
        return res.status(400).json({ err: [ { msg: 'Invalid Credentials' } ] });
    }

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