const jwt = require('jsonwebtoken');

function generateToken(user) {

    const secret = ensureSecret()

    const tokenOptions = {
        expiresIn: '1h'
    }

    return jwt.sign(payload, secret, tokenOptions);
}


function ensureSecret(req, res, next) {
    
    if(!process.env.JWT_SECRET){
        return res.status(500).json({ message: 'Internal Server Error' });
    }
    return process.env.JWT_SECRET;
}

function verifyToken(req, res, next) {

    const secret = ensureSecret();
    return jwt.verify(token, secret);
}


function authenticate(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];
    
    if(!token){
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const payload = verifyToken(token);
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}


module.exports={
    generateToken,
    ensureSecret,
    verifyToken,
    authenticate
}