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
        // emit new nickname list
        if (msg.message.search(new RegExp('^/nickcolor ')) !== -1)
        {
            let str = msg.message;

            // Get new nickname
            let newColor = str.split("/nickcolor")[1];
            newColor = newColor.replace(/(\r\n|\n|\r)/gm,"");
            newColor = newColor.replace(/^\s+|\s+$/g, '');
            users[user].color = "#" + newColor;

            socket.emit('serverMessage', {
                pos: messageList.length,
                message: `Nickname Color successfully changed to ${"#" + newColor}.`
            });
            socket.emit('myInfo', users[user]);
            io.emit("updateOnlineList", users);
            io.emit("newMessage", messageList);
        }
        else if (msg.message.search(new RegExp('^/nick ')) !== -1)
        {
            let str = msg.message;

            // Get new nickname
            let newName = str.split("/nick")[1];
            newName = newName.replace(/(\r\n|\n|\r)/gm,"");
            newName = newName.replace(/^\s+|\s+$/g, '');

            let foundName = false;
            let userKeys = Object.keys(users);
            for (let i = 0; i < userKeys.length; i++)
            {
                // If I am not looking at my own user entry
                if (users[userKeys[i]]["uid"] != user)
                {
                    // If thier name is the same as mine
                    if (newName == users[userKeys[i]]["name"] && users[userKeys[i]]["online"])
                    {
                        // Change name back to default cookie UID and inform them
                        socket.emit('serverMessage', {
                            pos: messageList.length,
                            message: `Somebody already goes by the name ${newName}.`
                        });
                        foundName = true;
                        break;
                    }
                }
            }

            if (foundName === false)
            {
                users[user].name = newName;
                socket.emit('serverMessage', {
                    pos: messageList.length,
                    message: `Nickname successfully changed to ${newName}.`
                });
            }

            socket.emit('myInfo', users[user]);
            io.emit("updateOnlineList", users);
            io.emit("newMessage", messageList);
        }
        // Invalid command catch
        else if (msg.message.search(new RegExp('^/')) !== -1)
        {
            console.log("Here");
            socket.emit('serverMessage', {
                pos: messageList.length,
                message: 'Invalid Command.'
            });
            io.emit("newMessage", messageList);
        }
        // Regular message
        else
        {
            msg.uid = user;
            msg.timestamp = new Date();
            messageList.push(msg);
            io.emit("newMessage", messageList);
        }
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
                color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                online: true
            };

            user = cookie_UID;

            socket.emit('newCookie', users[cookie_UID]);
            socket.emit('serverMessage', {
                pos: messageList.length,
                message: `You are ${users[cookie_UID]["name"]}.`
            });
        }
        else {
            // Check if there username has been taken in the mean time
            let myName = users[msg]["name"];
            let userKeys = Object.keys(users);
            for (let i = 0; i < userKeys.length; i++)
            {
                // If I am not looking at my own user entry
                if (users[userKeys[i]]["uid"] != msg)
                {
                    // If thier name is the same as mine
                    if (myName == users[userKeys[i]]["name"])
                    {
                        // Change name back to default cookie UID and inform them
                        socket.emit('serverMessage', {
                            pos: messageList.length,
                            message: `Your old nickname (${users[msg]["name"]}) has been taken.`
                        });
                        users[msg]["name"] = "User" + msg;
                        break;
                    }
                }
            }

            socket.emit('serverMessage', {
                pos: messageList.length,
                message: `You are ${users[msg]["name"]}.`
            });
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
