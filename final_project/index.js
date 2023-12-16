const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { users } = require('./router/auth_users.js');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    if(req.session.authorization) {
        token = req.session.authorization["accessToken"];
        jwt.verify(token, "access", (err,user) =>{
            if(!err){
                req.user = user;
                next();
            } else {
                return res.status(403).json({message: "User not authenticated"})
            }
        });
    } else {
        return res.status(403).json({message: "User not logged in"})
    }
});

app.post("/customer/login", (req, res) =>{
    const user = req.body.user;
    const password = req.body.password;

    if(!user || !password) {
        return res.status(404).json({message: "Error logging in"});
    }

    if(authenticatedUser(user,password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 30 * 60 });
        req.session.authorization = {
            accessToken, user
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({message: "Invalid Login. Check username and password!"});
    }
});

const doesExist = (user) =>{
    let userWithSameName = users.filter((usr) => {
        return usr.user === user
    });
    if (userWithSameName.length > 0){
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (user, password) =>{
    let validUser = users.filter((usr) =>{
        return (usr.user === user && usr.password === password)
    });
    if(validUser.length>0){
        return true;
    } else {
        return false;
    }
}

app.post("/customer/register", (req, res) =>{
    const user = req.body.user;
    const password = req.body.password;

    if (user && password) {
        if (!doesExist(user)) {
            users.push({"user":user, "password":password});
            return res.status(200).json({message: "User successfully registred. Now you can login"});
        } else {
            return res.status(404).json({message:"User already exists!"});
        }
    }
    return res.status(404).json({message: "Unable to register user."})
})

const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
