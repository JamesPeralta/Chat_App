const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const cookieParser = require('cookie-parser');

// Cookie constants
const COOKIE = "uid";

// In Memory data structures
let users = {};
let messageList = [];

app.use(cookieParser());
app.use(express.static('chat-frontend'));

app.get('/chat', function (req, res) {
    res.sendFile(__dirname + '/chat-frontend/index.html');
});

// Socket logic
io.on('connection', function (socket) {
    let user;

    socket.on('chat message', function (msg) {
        msg.uid = user;
        msg.timestamp = new Date();
        messageList.push(msg);
        io.emit("newMessage", messageList);
    });

    socket.on('online', function (msg) {
        // If No cookie
        if (msg === "" || !(msg in users))
        {
            let new_cookie = generateCookie();
            let cookie_UID = new_cookie[COOKIE];
            users[cookie_UID] = {
                uid: cookie_UID,
                name: "User" + cookie_UID,
                color: "Red",
                online: true
            };

            user = cookie_UID;

            socket.emit('newCookie', users[cookie_UID]);
        }
        else {
            user = msg;

            users[user]["online"] = true;
            socket.emit('myInfo', users[msg]);
        }

        io.emit("updateOnlineList", users);
        io.emit("newMessage", messageList);
    });

    socket.on('disconnect', function () {
        if (users[user]) {
            users[user]["online"] = false;
            io.emit("updateOnlineList", users);
        }
    });
});

http.listen(3000, function () {
    console.log('listening on port 3000');
});

// Helper functions
function generateCookie() {
    // Generate cookie:
    let random_number = Math.floor((Math.random() * 100000) + 1);
    let cookie_content = {
        uid: random_number,
    };

    return cookie_content;
}
