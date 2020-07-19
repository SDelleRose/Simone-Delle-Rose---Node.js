const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const contentChatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');


// create server
const app = express();
const server = http.createServer(app);

//set static folder
app.use(express.static(path.join(__dirname, 'public')))

//______________Socket.io________________//

const io = socketio(server);


// run when client connect
io.on('connection', socket => {




    //user joins the chat
    socket.on('joinRoom', ({ room, username }) => {
        const user = userJoin(socket.id, room, username);

        socket.join(user.room);

        //wellcome current user
        socket.emit('message', contentChatMessage('server', 'Benvenuto in ChatMask! ', 0))


        //broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', contentChatMessage('server', `${user.username} si è unito alla chat `, 0))



        // send users and room info
        io.to(user.room).emit('roomUsers', { room: user.room, users: getRoomUsers(user.room) })

    });


    //listen message writing event
    socket.on('writing', (data) => {
        socket.broadcast.emit('writing', data)
    })


    //listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', contentChatMessage(user.username, msg, socket.id))
    })

    //runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit('message', contentChatMessage('server', `${user.username} ha lasciato la chat `, 0));
            // send users and room info
            io.to(user.room).emit('roomUsers', { room: user.room, users: getRoomUsers(user.room) })
        }

    })
});




const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));