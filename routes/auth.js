const express = require("express");
const router = express.Router();
const db = require("../db");
const { generateToken } = require("../jwt");


const signup = (req, res) => {
    try {

        // check for userName, email, password
        const { userName, name, email, password, phone } = req.body;
        if(!userName || !email || !password) return res.status(500).json({error: "required userName, email and password"});

        // check if user already exists
        const q = "SELECT * FROM users WHERE user_name = $1";

        db.query(q, [userName], (err, data) => {
            if(err) {
                return res.status(500).json({error: "internal server error"});
            }
            if(data.rows.length > 0) {
                // user already exists
                return res.status(401).json({message: "user already registered"})
            }

            // user does not exist, create one
            const q = "INSERT INTO users (user_name, name, email_id, pass, phone) values ($1, $2, $3, $4, $5)";

            db.query(q, [userName, name, email, password, phone], (err, data) => {
                if(err) {
                    return res.status(500).json(err);
                }

                // user details inserted, create the jwt token
                const payLoad = userName;
                const token = generateToken(payLoad);
                res.status(200).json({message: "Signup successfull. Go to login"});
            })
        })
    }
    catch(err) {
        res.status(500).json({error: "internal server error"});
    }
}


const login = (req, res) => {
    try {
        const { userName, password } = req.body;

        if(!userName || !password) return res.status(500).json({error: "required userName and password"});
    
        // search for the user
        const q = "SELECT * FROM users WHERE user_name = $1";
        db.query(q, [userName], (err, data) => {
            if(err) return res.status(500).json({error: "internal serval error"});
            if(data.rowCount === 0) return res.status(401).json({message: "user does not exist"});

            // user record found
            const correctPass = data.rows[0].pass;
            if(correctPass != password) return res.status(401).json({error: "invalid login cridentials"});

            // password matches
            const payLoad = userName;
            const token = generateToken(payLoad);

            // remove the user password from the data to return
            const { pass, ...remainingUserData } = data.rows[0];
            remainingUserData["token"] = token;

            res.status(200).json({ message: "Login successfull", userData: remainingUserData });
        })
    }
    catch(err) {
        return res.status(500).json({error: "internal server error"});
    }
}


// route for signup and login
router.post("/signup", signup);
router.post("/login", login);


module.exports = router;