var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(process.env.PORT || 5000, function () {});

var games = [];

io.on('connection',function(socket){
    socket.on('join game',function(data) {
        socket.join(data.game.uuid);
        if (typeof games[data.game.uuid] === 'undefined') {
            console.log('undefined game id, creating game');
            console.log(data.game.uuid);
            games[data.game.uuid] = {
                players: [data.player]
            };
            socket.emit('game joined', []);
        }
        else {
            io.to(data.game.uuid).emit('player joined', data.player);
            socket.emit('game joined', games[data.game.uuid].players);
            games[data.game.uuid].players.push(data.player);
        }

    });
    socket.on('attack',function(data){
        console.log(data);
    });
    socket.on('ready to start game',function(data){
        io.to(data.game.uuid).emit('start game');
    });
    socket.on('send my player info',function(data){
        io.to(data.game.uuid).emit('player joined',data.player);
    })
});
