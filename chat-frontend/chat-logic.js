// James Peralta
// 30010233
// Lab B02

let socket = io();
let userData = null;
let users = null;
let myID = null;
let serverMessages = []; // Contains messages and positions

const COOKIE = "uid";
const NICKNAME = "name";
const SERVERID = "0.0.0.0";

$(document).ready(function () {
    let myID = getCookie("uid");
    socket.emit('online', myID);

    // Whenever the server sends me a new cookie I replace mine
    socket.on('newCookie', function (msg) {
        setCookie(COOKIE, msg[COOKIE], 1);
        userData = msg;
        setUserName();
    });

    // My Info upon every restart
    socket.on('myInfo', function (msg) {
        userData = msg;
        setUserName();
    });

    // Everytime online list updates
    socket.on("updateOnlineList", function (msg) {
        users = msg;
        refreshOnlineList(msg);
        setUserName();
    });

    // Everytime online list updates
    socket.on("newMessage", function (msg) {
        refreshMessageList(msg);
    });

    // Everytime online list updates
    socket.on("serverMessage", function (msg) {
        let serverLength = serverMessages.length;
        serverMessages.push({
            uid: SERVERID,
            pos: msg["pos"] + serverLength,
            message: msg["message"]
        });
    });

    // Add enter handler
    $("#msg-text").on('keyup', function (e) {
        if (e.key === "Enter") {
            let message_content = {
                message: $('#msg-text').val()
            };
            $('#msg-text').val("");
            socket.emit('chat message', message_content);
        }
    });

    // Add send button event handler
    $('#send-button').click(function (e) {
        e.preventDefault();
        let message_content = {
            message: $('#msg-text').val()
        };
        $('#msg-text').val("");
        socket.emit('chat message', message_content);
    });
});

function setUserName() {
    $('#current-user').text("You are " + userData[NICKNAME] + ".");
}

function getTimeString(dateObject)
{
    let ts = new Date(dateObject);
    let h = ts.getHours();
    if (h.toString().length < 2){
        h = "0" + h;
    }
    let m = ts.getMinutes();
    if (m.toString().length < 2){
        m = "0" + m;
    }

    return h + ":" + m;
}

function refreshMessageList(allMessages) {
    for (let i = 0; i < serverMessages.length; i++) {
        allMessages.splice(serverMessages[i]["pos"], 0, serverMessages[i]);
    }
    $('#chat-content').empty();
    // Splice server messages into the array
    for (let i = 0; i < allMessages.length; i++) {
        let theMessage = allMessages[i];

        let messageUserID = theMessage["uid"];

        if (messageUserID == SERVERID)
        {
            $('#chat-content').append($('<li class="text-break">' + theMessage["message"] + '</li>'));
        }
        else
        {
            let timestamp = getTimeString(theMessage["timestamp"]);
            let username = users[theMessage["uid"]]["name"];
            let message = theMessage["message"];
            let color = users[theMessage["uid"]]["color"];
            let messageUID = theMessage["uid"];

            let full_message = timestamp + ` <span style="color: ${color}">` + username + '</span>: ' + message;
            if (userData["uid"] == messageUID){
                full_message = "<b><i>" + full_message + "</i></b>";
            }
            $('#chat-content').append($('<li class="text-break">' + full_message + '</li>'));
        }
    }

    let objDiv = document.getElementById("chat-content");
    objDiv.scrollTop = objDiv.scrollHeight;
}

function refreshOnlineList(onlineUsers) {
    $('#user-content').empty();
    const values = Object.values(onlineUsers);
    for (let i = 0; i < values.length; i++) {
        let color = values[i]["color"];
        let nickname = values[i]["name"];
        let status = values[i]["online"];
        if (status === true)
        {
            $('#user-content').append($(`<li class="text-break" style="color: ${color}">` + nickname + "</li>"));
        }
    }
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
