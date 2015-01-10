module.exports = function(sequelize,DataTypes){
    var User = sequelize.define('User',{
        uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        email: {
            type: DataTypes.STRING(255),
            unique: true
        },
        password: DataTypes.STRING,
        color: {
            type: DataTypes.STRING(6),
            validate: {
                is: /^[a-fA-F0-9]{6}/i,
                len: [6,6]
            }
        }
    });
    return User;
};