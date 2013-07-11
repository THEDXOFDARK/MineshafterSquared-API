/**
 * User
 */
module.exports = function(sequelize, DataTypes) {
    // dependencies
    var crypto = require('crypto');
    
    return sequelize.define("user", {
        usertype_id         : DataTypes.INTEGER,
        email               : DataTypes.STRING,
        username            : DataTypes.STRING,
        hashed_password     : DataTypes.STRING,
        session             : DataTypes.STRING,
        server              : DataTypes.STRING,
        last_game_login     : DataTypes.INTEGER,
        last_web_login      : DataTypes.INTEGER,
        premium             : DataTypes.BOOLEAN,
        remember_me         : DataTypes.STRING
    },
    // configuration
    {
        underscored: true,
        
        classMethods: {
            login : function(username, password, callback) {
                var user = null;
                
                // Try and find user's record
                this.find({ where : [ 'email = ? OR username = ?', username, username] })
                    .success(function(user){
                        if (user !== null) {
                            user.validate_password(password, function(valid_user){
                                // generate session id upon correct login
                                valid_user.generate_session_id(function(id){
                                    valid_user.session = session_id;
                                    valid_user.save().success(callback);
                                });
                            }, function(error){
                                callback(null);
                            });
                        } else {
                            callback(null);
                        }
                    }).error(function(error) {
                        callback(null);
                    });
                ;
            }
        },
        
        instanceMethods : {
            validate_password : function(password, callback, errorback) {
                var salt = this.hashed_password.substr(0, 64);
                var hash = this.hashed_password.substr(64);
                
                // re-hash to make sure it all works out
                var salted_password = salt + password;
                var password_hash = crypto.createHash('sha256').update(salted_password).digest('hex');
                
                // return if they match or not
                if(password_hash === hash) {
                    callback(this);
                } else {
                    errorback(this);
                }
            },
            
            generate_session_id : function(callback) {
                var idPt1 = Math.floor(Math.random() * 2147483647) + 1000000000;
                var idPt2 = Math.floor(Math.random() * 2147483647) + 1000000000;
                var id = idPt1 + idPt2;
                
                callback(id);
            }   
        },
    });
}