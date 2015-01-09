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
    this.players = [];
    this.addPlayer = function(player){
        this.players.push(player)
    };
    this.removePlayer = function(player){
        this.players.splice(this.players.indexOf(player),1);
    };
};

var players = [];
var Player = function(name){
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

function registerPlayer(username){
    var player = new Player(username);
    players.push(player);
    return players.indexOf(player);
}


io.on('connection',function(socket){
    socket.on('join game',function(data){
        console.log(data);
        socket.gameId = getGameIndexByPassword(data.gamePassword);
        socket.playerId = registerPlayer(data.username);
        if(socket.gameId === false){
            var game = new Game(data.gamePassword);
            game.addPlayer(socket.player);
            games.push(game);
            socket.gameId = games.indexOf(game);
        }
        else{
            games[socket.gameId].addPlayer(socket.player);
        }
        socket.join(socket.gameId);
        socket.emit('game joined',socket.gameId);
        if(games[socket.gameId].players.length == 2){
            socket.broadcast.to(socket.gameId).emit('start game');
        }
    });
    socket.on('attack',function(data){
        socket.broadcast.to(data.gamePassword).emit('attack',{
            'player': socket.player,
            'planet':data.planet
        });
    });
});
