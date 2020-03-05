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
let onlineUsers = [];

// In memory message list
let messageList = [];

app.use(cookieParser());
app.use(express.static('chat-frontend'));

app.get('/chat', function (req, res) {
    // Check if this user has a cookie
    if (COOKIE_NAME in req.cookies) {
        let userNum = req.cookies.userData["user_num"];
        // console.log("User already has cookie #" + req.cookies.userData["user_num"]);

        // If this server restarted I need to re-populate to nickname map
        if (userNum in users == false)
        {
            users[userNum] = {};
        }
    }
    // If we don't know about the user, give them a cookie
    else {
        let cookie_content = generateCookie();
        res.cookie(COOKIE_NAME, cookie_content, {maxAge:TIME_TO_LIVE});
    }

    res.sendFile(__dirname + '/chat-frontend/index.html');
});

app.get("/getID", function (req, res) {
    let userNum = req.cookies.userData["user_num"];
    res.send({"user_id": userNum});
});

app.get("/getData", function (req, res) {
    let userNum = req.cookies.userData["user_num"];
    res.send({"user_data": users[userNum]});
});

app.get("/logout", function (req, res) {
    res.clearCookie('userData');
    res.send('user has logged out');
});

app.get("/messagelist", function (req, res) {
    res.send(messageList);
});

// Socket logic
io.on('connection', function (socket) {
    socket.on('chat message', function (msg) {
        msg.timestamp = new Date();
        messageList.push(msg);

        // Check if they are changing their nickname and
        // emit new nickname list
        if (msg.message.search(new RegExp("^/nick")) !== -1)
        {
            io.emit('nicknameChange', onlineUsers);
        }
        // Check if they are changing thier color
        else
        {
            io.emit('chat message', msg);
        }
    });

    socket.on('online', function (msg) {
        // Get user nickname
        let nickname = users[msg]["nickname"];
        users[msg]["socket_id"] = socket.id;

        if (onlineUsers.includes(nickname) === false) {
            onlineUsers.push(nickname);
        }

        io.emit('online', {"OnlineUsers": onlineUsers, "AllMessages": messageList});
    });

    socket.on('disconnect', function () {
        // Find the user that disconnected
        let disc_socket = socket.id;

        const keys = Object.keys(users);
        // For all users
        for (let i = 0; i < keys.length; i++) {
            let nickname = users[keys[i]]["nickname"];
            let socket_id = users[keys[i]]["socket_id"];

            if (disc_socket === socket_id)
            {
                let newOnline = [];
                for (let j = 0; j < onlineUsers.length; j++)
                {
                    let user = onlineUsers.pop();
                    if (nickname !== user)
                    {
                        newOnline.push(user);
                    }
                }
                onlineUsers = newOnline;
                break;
            }
        }
        io.emit('online', {"OnlineUsers": onlineUsers, "AllMessages": messageList});
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
        user_num: random_number,
    };

    let user_info = {
        nickname:"User" + random_number,
        user_color: [255, 255, 255],
        socket_id: null
    };

    // Store user with nickname information
    users[random_number] = user_info;

    return cookie_content;
}
