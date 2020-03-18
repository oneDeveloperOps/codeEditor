const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req , res , next) => {
    //get token from header
    const token = req.header('x-auth-token');

    //check if no token
    if(!token) {
        return res.status(401).json({ msg: 'unauthorized' });
    }
    //verify token
    try {
        const decoded = jwt.verify(token , config.get('jwtSecretToken'));
        req.user = decoded.user;
        next();
    }catch(err){
        res.status(401).json({ msg: 'Token not authorized' })
    }
}