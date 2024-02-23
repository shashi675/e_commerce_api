const jwt = require("jsonwebtoken");


// middleWare for authorization
const jwtAuthMiddleWare = (req, res, next) => {
    try {
        // check request header has authorization or not
        const authorization = req.headers.authorization;
        if(!authorization) return res.status(401).json({error: "token not found"});

        // check for jwt token from authorization
        const token = authorization.split(' ')[1];
        if(!token) return res.status(401).json({error: "Unathorized access"});

        // verify the token
        const decodedData = jwt.verify(token, process.env.secretKey);
        req.userName = decodedData;
        next();

    } catch (err) {
        res.status(401).json({error: "invalid token"});
    }
}


// middleWare for generate token
const generateToken = (payLoad) => {
    return jwt.sign(payLoad, process.env.secretKey);
}


module.exports = { generateToken, jwtAuthMiddleWare };