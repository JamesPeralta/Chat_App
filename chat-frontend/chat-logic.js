let socket = io();
let nicknameRequest = "http://localhost:3000/getuser";

$(document).ready(function () {
    // Add send button event handler
    $('#send-button').click(function (e) {
        e.preventDefault();
        console.log("Here");
        socket.emit('chat message', $('#msg-text').val());
    });

    // Fix user name
    $('#current-user').text(getUserData());

    socket.on('chat message', function (msg) {
        $('#chat-content').append($('<li>').text(msg));
    });
});

function getUserData()
{
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", nicknameRequest, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}