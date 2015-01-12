module.exports = function(sequelize,DataTypes){
    var User = sequelize.define('User',{
        uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        email: {
            type: DataTypes.STRING(255),
            unique: true,
            validate: {
                is: {
                    args: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i,
                    msg: "Invalid Email Address"
                }
            }
        },
        password: DataTypes.STRING,
        color: {
            type: DataTypes.STRING(6),
            validate: {
                is: {
                    args: /^[a-fA-F0-9]{6}/i,
                    msg: "Color must be 6 HEX digits"
                }
            }
        }
    });
    return User;
};