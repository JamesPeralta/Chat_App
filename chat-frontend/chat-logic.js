let socket = io();
let nicknameRequest = "http://localhost:3000/getuser";
let userName = null;

$(document).ready(function () {
    // Fix user name
    userName = getUserData();
    $('#current-user').text("You are " + userName + ".");

    // Add send button event handler
    $('#send-button').click(function (e) {
        e.preventDefault();
        let message_content = {
            username: userName,
            message: $('#msg-text').val()
        };
        socket.emit('chat message', message_content);
    });

    socket.on('chat message', function (msg) {
        let timestamp = msg["timestamp"];
        let username = msg["username"];
        let message = msg["message"];

        let full_message = timestamp + " " + username + ": " + message;
        $('#chat-content').append($('<li>').text(full_message));
    });
});

function getUserData()
{
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", nicknameRequest, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}