let socket = io();

$(document).ready(function () {
    $('#send-button').click(function (e) {
        e.preventDefault();
        console.log("Here");
        socket.emit('chat message', $('#msg-text').val());
    });

    socket.on('chat message', function (msg) {
        $('#chat-display').append($('<li>').text(msg));
    });
});