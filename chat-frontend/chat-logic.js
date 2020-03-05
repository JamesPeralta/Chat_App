let socket = io();
let idRequest = "http://localhost:3000/getID";
let userDataRequest = "http://localhost:3000/getData";
let userID = null;
let userData = null;

$(document).ready(function () {
    // Fix user name
    userID = getUserID();
    userData = getUserData();

    // Temporary clear
    clearCookies();

    console.log(userData);
    $('#current-user').text("You are " + userData["nickname"] + ".");

    // Inform server what user you are
    socket.emit('online', userID);

    // Add send button event handler
    $('#send-button').click(function (e) {
        e.preventDefault();
        let message_content = {
            username: userData["nickname"],
            message: $('#msg-text').val()
        };
        $('#msg-text').val("");
        socket.emit('chat message', message_content);
    });

    // Add enter handler
    $("#msg-text").on('keyup', function (e) {
        if (e.keyCode === 13) {
            let message_content = {
                username: userData["nickname"],
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

        let full_message = timestamp + ' <span>' + username + '</span>: ' + message;
        $('#chat-content').append($('<li>' + full_message + '</li>'));
    });

    // On a user joining
    socket.on('online', function (msg) {
        let onlineUsers = msg.OnlineUsers;
        refreshOnlineList(onlineUsers);

        let allMessages = msg.AllMessages;
        refreshMessageList(allMessages);
    });

    // On nickname change
    socket.on('nicknameChange', function (msg) {
        let onlineUsers = msg.OnlineUsers;
        refreshOnlineList(onlineUsers);
    });
});

function clearCookies()
{
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", "http://localhost:3000/logout", false );
    xmlHttp.send( null );
}

function getUserID()
{
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", idRequest, false );
    xmlHttp.send( null );
    let response = JSON.parse(xmlHttp.responseText);
    return response["user_id"];
}

function getUserData()
{
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", userDataRequest, false );
    xmlHttp.send( null );
    let response = JSON.parse(xmlHttp.responseText);
    return response["user_data"];
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
    $('#chat-content').empty();
    for (let i = 0; i < allMessages.length; i++) {
        let theMessage = allMessages[i];
        let timestamp = getTimeString(theMessage["timestamp"]);
        let username = theMessage["username"];
        let message = theMessage["message"];

        // TODO: Define if it's my message or not to bold
        let full_message = timestamp + ' <span>' + username + '</span>: ' + message;
        $('#chat-content').append($('<li>' + full_message + '</li>'));
    }
}

function refreshOnlineList(onlineUsers) {
    $('#user-content').empty();
    for (let i = 0; i < onlineUsers.length; i++) {
        $('#user-content').append($('<li>').text(onlineUsers[i]));
    }
}
