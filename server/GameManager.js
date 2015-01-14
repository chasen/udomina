module.exports = function(Game){
    return {
        games: [],
        getGameById: function(id){
            for( game in this.games){
                if(game.id == id){
                    return this.games[this.games.indexOf(game)];
                }
            }
            return false
        },
        createGame: function(gameId){
            var game = new Game();
            game.setId(gameId);
            this.games.push(game);
            return game;
        },
        getGames: function (){
            return this.games;
        }

    };
};