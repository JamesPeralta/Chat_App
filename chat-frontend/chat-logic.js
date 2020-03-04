let socket = io();
let nicknameRequest = "http://localhost:3000/getuser";
let userName = null;

$(document).ready(function () {
    // Fix user name
    userName = getUserData();
    $('#current-user').text("You are " + userName + ".");

    // Inform server what user you are
    socket.emit('online', userName);

    // Add send button event handler
    $('#send-button').click(function (e) {
        e.preventDefault();
        let message_content = {
            username: userName,
            message: $('#msg-text').val()
        };
        $('#msg-text').val("");
        socket.emit('chat message', message_content);
    });

    // Add enter handler
    $("#msg-text").on('keyup', function (e) {
        if (e.keyCode === 13) {
            let message_content = {
                username: userName,
                message: $('#msg-text').val()
            };
            $('#msg-text').val("");
            socket.emit('chat message', message_content);
        }
    });

    // On new message
    socket.on('chat message', function (msg) {
        let timestamp = getTimeString(msg["timestamp"]);
        let username = msg["username"];
        let message = msg["message"];

        let full_message = timestamp + " " + username + ": " + message;
        $('#chat-content').append($('<li>').text(full_message));
    });

    // On a user joining
    socket.on('online', function (msg) {
        // Populate user list upon join
        $('#user-content').empty();
        let onlineUsers = msg.OnlineUsers;
        for (let i = 0; i < onlineUsers.length; i++) {
            $('#user-content').append($('<li>').text(onlineUsers[i]));
        }

        // Populate chat content upon join
        $('#chat-content').empty();
        let allMessages = msg.AllMessages;
        for (let i = 0; i < allMessages.length; i++) {
            let theMessage = allMessages[i];
            let timestamp = getTimeString(theMessage["timestamp"]);
            let username = theMessage["username"];
            let message = theMessage["message"];

            let full_message = timestamp + " " + username + ": " + message;
            $('#chat-content').append($('<li>').text(full_message));
        }
    });
});

function getUserData()
{
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", nicknameRequest, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
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