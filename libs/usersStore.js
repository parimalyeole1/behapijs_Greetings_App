const bcrypt = require("bcryptjs");
const Boom = require("boom");
const UsersStore = {};

UsersStore.users = {};

UsersStore.initialize = () => {
    UsersStore.createUser("Parimal", "parimal.yeole1@gmail.com", "password");
}

UsersStore.createUser = (name, email, password, cb) => {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
            const user = {
                name: name,
                email: email,
                passwordhash: hash
            };
            if (UsersStore.users[email]) {
                cb(Boom.conflict("Email alredy exist. Please login."))
            } else {
                UsersStore.users[email] = user;
                if (cb) cb();
            }
        })
    })
}

UsersStore.validateUser = (email, password, cb) => {
    const user = UsersStore.users[email];
    if(!user){
        cb(Boom.notFound("User do not exist."));
        return;
    }
    bcrypt.compare(password, user.passwordhash,(err, isValid)=>{
        if(!isValid) {
            cb(Boom.unauthorized('Password does not match.'));
        }else{
            cb(null,user);
        }
    })
}

module.exports = UsersStore;