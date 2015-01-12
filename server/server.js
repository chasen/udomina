var express = require('express');
var app = express();
var server = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(server);
var crypto = require('crypto');
var env = process.env.NODE_ENV || 'development';
var config = require('./config')[env];
var bodyParser = require('body-parser');
var Sequelize = require('sequelize')
    , sequelize = new Sequelize(config.database.db, config.database.user, config.database.password, {
        host: config.database.host,
        dialect: "mysql",
        port:    config.database.port
    });

var Game = sequelize.import(__dirname + "/../models/game");
var User = sequelize.import(__dirname + "/../models/user");
User.belongsToMany(Game, {as: 'Players', through: 'Games_Users'});
Game.belongsToMany(User, {as: 'Games', through: 'Games_Users'});
Game.hasOne(User, {as: 'winner'});
sequelize.sync(
    //{force:true}
).complete(function(err) {
    if (!!err) {
        console.log('An error occurred while creating the table:', err)
    } else {
        console.log('DB Loaded!')
    }
});

function createSha256Hash(input){
    return crypto.createHash('sha256').update(input).digest('hex')
}

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
app.use(express.static('public'));
app.get('/js/client.js', require('browserify-middleware')('./client/client.js'));
app.post('/register',function(req, res){
    if(req.body.password === req.body.repeated_password){
        User.create({
            'email':req.body.email,
            'password': createSha256Hash(req.body.password),
            'color': req.body.color
        }).complete(function(err,user){
            if(err){
                return res.status(400).send({message: err.message});
            }
            return res.send(user.uuid);
        })
    }
    else{
        return res.status(400).send({'message': 'Passwords must match'});
    }

});
app.post('/login',function(req, res){
    User.find({ where: {email: req.body.email}}).then(function(user){
        if(user !== null){
            if(createSha256Hash(req.body.password) === user.password){
                return res.send(user.uuid);
            }
            else{
                return res.status(400).send({'message':'Invalid Password'})
            }
        }
        else{
            return res.status(400).send({'message':'Invalid email'})
        }
    });
});
app.get('/games',function(req, res){
    res.send(games)
});
app.post('/create-game',function(req,res){
    Game.create(req.body)
        .complete(function(err,game){
            if(err){
                res.status(400).send({message: "Game creation failed: "+err.message})
            }
            else{
                res.send(game);
            }
        });
});
app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname + '/../templates/index.html'));
});

server.listen(process.env.PORT || 5000, function () {});




var games = [];


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
