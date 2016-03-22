var password = require('password-hash');
var jwt = require('jsonwebtoken');
var q = require('q');

exports = module.exports = function(app){
    return {
        post : function (request) {
            var defer = q.defer();
            var collection = request.db.get('user');
            var user = request.param('user');
            collection.find({username: user.username},{},function(data){
                if (!data){
                    user.password = password.generate(user.password);
                    collection.insert(user,{w:1},function(err,user){
                        if (err){
                            defer.reject({status: 500});
                        } else {
                            delete user.password;
                            var token = jwt.sign(user, app.get('jwtSecret'));
                            defer.resolve({status: 200, json: {authToken: token}})
                        }
                    });
                } else {
                    defer.reject({status: 409, msg: 'Username Conflict'});
                }
            });
            return defer.promise;
        }
    };
};