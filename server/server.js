var express = require('express');
var app = express();
var server = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(server);

app.use(express.static('public'));
app.get('/js/client.js', require('browserify-middleware')('./client/client.js'));
app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname + '/../templates/index.html'));
});

server.listen(process.env.PORT || 5000, function () {});

var games = [];
var Game = function(password,username){
    this.password = password;
    this.createdBy= username;
    this.players = [];
    this.players.push(username);
};

var players = [];
var player = function(name){
    this.name = name;
};

function getGameIndexByPassword(password){
    for(var i=0; i<games.length;i++){
        if(games[i].password === password){
            return i;
        }
    }
    return false
}


io.on('connection',function(socket){
    socket.on('register player',function(player){
        socket.player = player;
        players.push(player);
    });
    socket.on('join game',function(data){
        var gameId = getGameIndexByPassword(data.gamePassword);
        if(gameId === false){
            var game = new Game(data.gamePassword, data.username);
            games.push(game);
            gameId = games.indexOf(game);
        }
        socket.password = data.gamePassword;
        socket.join(data.gamePassword);
        socket.broadcast.to(data.gamePassword).emit('game joined',games.indexOf(game));
        if(games[gameId].players.length == 2){
            socket.broadcast.to(data.gamePassword).emit('start game');
        }
    });
    socket.on('attack',function(data){
        socket.broadcast.to(data.gamePassword).emit('attack',{
            'player': socket.player,
            'planet':data.planet
        });
    });
});
