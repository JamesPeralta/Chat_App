const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const cookieParser = require('cookie-parser');

// Cookie constants
const COOKIE_NAME = "userData";
const TIME_TO_LIVE = 360000;

// User in-memory DB. Contains user_num: nickname
let users = {};

app.use(cookieParser());
app.use(express.static('chat-frontend'));

app.get('/chat', function (req, res) {
    // Check if this user has a cookie
    if (COOKIE_NAME in req.cookies) {
        let userNum = req.cookies.userData["user_num"];
        let nickName = req.cookies.userData["nick_name"];
        console.log("User already has cookie #" + req.cookies.userData["user_num"]);

        // If this server restarted I need to re-populate to nickname map
        if (nickName in users == false)
        {
            users[userNum] = nickName;
        }
    }
    // If we don't know about the user give the a cookie
    else {
        let cookie_content = generateCookie();
        res.cookie(COOKIE_NAME, cookie_content, {maxAge:TIME_TO_LIVE});
    }

    res.sendFile(__dirname + '/chat-frontend/index.html');
});

app.get("/getuser", function (req, res) {
    let userNum = req.cookies.userData["user_num"];
    res.send(users[userNum]);
});

app.get("/logout", function (req, res) {
    res.clearCookie('userData');
    res.send('user has logged out');
});

// Socket logic
io.on('connection', function (socket) {
    socket.on('chat message', function (msg) {
        msg.timestamp = getTime();
        io.emit('chat message', msg);
    });
});

http.listen(3000, function () {
    console.log('listening on port 3000');
});

// Helper functions
function generateCookie() {
    console.log("issuing a new cookie");
    // Generate cookie:
    let random_number = Math.floor((Math.random() * 100000) + 1);
    let nickname = "User" + random_number;
    let cookie_content = {
        user_num: random_number,
        nick_name: nickname
    };

    // Store user with nickname information
    users[random_number] = nickname;

    return cookie_content;
}

function getTime()
{
    let today = new Date();
    let h = today.getHours();
    let m = today.getMinutes();

    return h + ":" + m;
}