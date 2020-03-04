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
        let timestamp = msg["timestamp"];
        let username = msg["username"];
        let message = msg["message"];

        let full_message = timestamp + " " + username + ": " + message;
        $('#chat-content').append($('<li>').text(full_message));
    });

    // On a user joining
    socket.on('online', function (msg) {
        $('#user-content').empty();
        for (let i = 0; i < msg.length; i++) {
            $('#user-content').append($('<li>').text(msg[i]));
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