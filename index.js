const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const userModel = require('./models/user');
const postModel = require('./models/post');
const cookie = require('cookie-parser');
const session = require('express-session')
const jwt = require('jsonwebtoken');
const flash = require('connect-flash')
const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookie());

app.use((req, res, next) => {
    res.locals.success_msg = req.cookies.success_msg || '';
    res.locals.error_msg = req.cookies.error_msg || '';
    next();
});

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/login', (req, res) => {
    res.render('login');
})

app.get('/profile', isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({email: req.user.email});  //Note tht its req.USER.email, coz u are taking the email from the user
    res.render('profile', {user});
})

app.post('/profile', async (req, res) => {
    let user = await userModel.findOne({email: req.user.email});  //Note tht its req.USER.email, coz u are taking the email from the user
    res.render('profile', {user});
})

app.post('/register', async (req, res) => {
    let { username, name, email, password } = req.body;
    let user = await userModel.findOne({ email })
    if (user) {
        req.flash('error_msg', 'You are already registered', { maxAge: 3000 }); // 3 seconds
        res.redirect('/');
    } else {
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password, salt, async function (err, hash) {
                const user = await userModel.create({
                    username,
                    name,
                    email,
                    password: hash
                })
                let token = jwt.sign({ email: email }, "my-secret-keyword");
                res.cookie("token", token);
                res.cookie('success_msg', 'Registration Successful!', { maxAge: 6000 }); // 3 seconds
                res.redirect('/login');
            });
        });
    }
})

app.post('/login', async (req, res) => {
    let { email, password } = req.body
    let user = await userModel.findOne({ email })
    if (!user) {
        res.cookie('error_msg', 'Oops! Something went wrong', { maxAge: 5000 }); // 5 seconds
        res.redirect('/login');
    } else {
        bcrypt.compare(password, user.password, function (err, result) {
            let token = jwt.sign({ email: email }, "my-secret-keyword");
            res.cookie("token", token);
            if (result) {
                return res.status(200).redirect("/profile")
            } else {
                res.cookie('error_msg', 'Oops! Something went wrong', { maxAge: 6000 }); //6 seconds
            }

        })
    }
});

app.get('/logout', (req, res) => {
    res.cookie("token", "");
    res.redirect('/login')
})

function isLoggedIn(req, res, next) {
    if (req.cookies.token === "") {
        res.cookie('erroe_msg', 'You must be Logged In', { maxAge: 6000 }); //6 seconds
    }
    else {
        let data = jwt.verify(req.cookies.token, "my-secret-keyword");
        req.user = data;
    }
    next();
}

app.listen(4000);

// else {
// //     bcrypt.compare(user.password, password, )
// //     let token = jwt.sign({ email: email }, "my-secret-keyword");
// //     res.cookie("token", token);
// //     res.cookie('success_msg', 'Registration Successful!', { maxAge: 6000 }); // 3 seconds
// //     res.redirect('/profile');
// You must be logged in
// // }