const chatForm = document.getElementById('chat-form');
const chat = document.querySelector('.bubble-container');
const roomName = document.getElementById('room');
const usersList = document.querySelector('.users-list');
const messageCompailer = document.getElementById('message_compailer');



// get room and username from URL
const { room, username } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

// insert username in header
document.getElementById('username').innerHTML = username;

// opening the pop-up of active users, in the mobile version
users_list_button.onclick = () => {
    document.getElementById('box_users_list').className = 'box-users-list-popup';
    document.getElementById('close_popup').innerHTML = '<button id="close" onclick="close_popup()">x</button>'
}
// close pop-up
function close_popup() {
    document.getElementById('box_users_list').className = 'box-users-list';
    document.getElementById('close_popup').innerHTML = ''
}



//______________Socket.io________________//

const socket = io();


//get room and other users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

// join chatroom
socket.emit('joinRoom', { room, username });

// send message writing event
messageCompailer.addEventListener('keyup', () => {
    socket.emit('writing', ({ name: username, mex: messageCompailer.value }))
})

// get message writing event
socket.on('writing', (data) => {

    document.getElementById('xIsWriting').innerHTML = data.name + ' sta scrivendo..'
    
    if (data.mex === '') {
        document.getElementById('xIsWriting').innerHTML = ''
    }

    socket.on('message', message => {
        if (message.username === data.name) {
            document.getElementById('xIsWriting').innerHTML = ''
        }
    })
})


//get messages
socket.on('message', message => {
    outputMessage(message);

    //scroll down
    chat.scrollTop = chat.scrollHeight;
})

//message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //get message text
    const msg = e.target.elements.message_compailer.value;

    //emit message to server
    socket.emit('chatMessage', msg)

    //clear emit
    e.target.elements.message_compailer.value = '';
});

//output message to DOM
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('bubblebox');

    // definition of the type of message 

    // server message
    if (message.id === 0) {
        div.innerHTML = `<div class='server-bubble'>${message.text} <p> &nbsp;&nbsp;- ${message.time}</p></div>`
    }
    // empty message
    else if (message.text === '') {
        div.innerHTML = ''
    }
    // personal message
    else if (message.id === socket.id) {
        div.innerHTML = `<div></div>
    <div class='personal-bubble'>${message.text}<p class='time'>${message.time}</p></div>`
    }
    // message from others user
    else {
        div.innerHTML = `<div class='other-user-bubble'>
        <h6>${message.username}</h6>${message.text}<p class='time'>${message.time}</p>
    </div>
    <div></div>`
    }
    
    //insert in DOM
    chat.appendChild(div);
}

//add room name to DOM
function outputRoomName(room) {
    roomName.innerHTML = room;
}

//add users in list to DOM
function outputUsers(users) {
    document.getElementById('utentsnumber').innerHTML = users.length;
    usersList.innerHTML = users.map(user => `<h4>${user.username}</h4>`).join('')
}