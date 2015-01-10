module.exports = function(sequelize, DataTypes){
    var Game = sequelize.define('Game',{
        uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        startedAt: {
            type: DataTypes.DATE,
            nullable: true
        },
        endedAt: {
            type: DataTypes.DATE,
            nullable: true
        },
        mapSeed: {
            type: DataTypes.STRING,
            nullable: true
        },
        isPublic: DataTypes.BOOLEAN,
        password: {
            type: DataTypes.STRING,
            nullable: true
        },
        maxPlayers: DataTypes.INTEGER,
        minPlanets: DataTypes.INTEGER,
        maxPlanets: DataTypes.INTEGER
    });
    return Game;
};
