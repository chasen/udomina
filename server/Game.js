module.exports = function(){
    return {
        id: '',
        map: {},
        players: [],
        getId: function(){
            return this.id;
        },
        setId: function(newId){
            this.id = newId;
        },
        addPlayer: function(player){
            this.players.push(player);
        },
        getPlayer: function (id){
            for(player in this.players){
                if(player.uuid == id){
                    return player;
                }
            }
            return null;
        },
        getPlayers: function (){
            return this.players;
        },
        getMap: function (){
            return this.map;
        },
        setMap: function (newMap){
            this.map = newMap;
        },
        getRandomMap: function (){
            var request = require('request');
            request('http://www.udomina.com/game/get-random-map/', function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    this.map = JSON.parse(body);
                }
            })
        }

    };
};