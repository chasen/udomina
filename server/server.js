var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);


server.listen(process.env.PORT || 5000, function () {});
var Game = require('./Game');
var GameManager = require('./GameManager')(Game);

io.on('connection',function(socket){
    socket.on('join game',function(data) {
        socket.join(data.game.uuid);
        var game = GameManager.getGameById(data.game.uuid);
        if (game === false) {
            game = GameManager.createGame(data.game.uuid);
        }
        game.addPlayer(data.player);
        console.log(game);
        socket.emit('game joined');
        if(game.getPlayers().length == game.map.supportedPlayers){
            io.to(game.id).emit('start game',game);
        }
        console.log(GameManager.getGames());
    });
    socket.on('send attack',function(data){
        var game = GameManager.getGameById(data.game.uuid);
        if(!game){ return; }
        io.to(game.id).emit('attack',data.attack);
        console.log(data);
    });
});
