let socket = io();
let nicknameRequest = "http://localhost:3000/getuser";
let userName = null;

$(document).ready(function () {
    // Fix user name
    userName = getUserData();
    $('#current-user').text(userName);

    // Add send button event handler
    $('#send-button').click(function (e) {
        e.preventDefault();
        message_content = {
            timestamp: getTime(),
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

function getTime()
{
    let today = new Date();
    let h = today.getHours();
    let m = today.getMinutes();

    return h + ":" + m;
}

function getUserData()
{
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", nicknameRequest, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}