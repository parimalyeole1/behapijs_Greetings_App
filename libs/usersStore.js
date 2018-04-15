const bcrypt = require("bcryptjs");
const Boom = require("boom");
const UsersStore = {};

UsersStore.users = {};

UsersStore.initialize = () => {
    return UsersStore.createUser("Parimal", "parimal.yeole1@gmail.com", "password");
}

UsersStore.createUser = (name, email, password, cb) => {
    return new Promise((resolve, reject) => {

        if (UsersStore.users[email]) {
            const boomErrorMsg = Boom.conflict("Email alredy exist. Please login.");
            if (cb) return cb(boomErrorMsg);
            reject(boomErrorMsg);
        } else {
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(password, salt, (err, hash) => {
                    const user = {
                        name: name,
                        email: email,
                        passwordhash: hash
                    };
                    UsersStore.users[email] = user;
                    if (cb) return cb(null, user);
                    resolve(user);
                })
            })
        }
    })
}

UsersStore.validateUser = (email, password, cb) => {
    return new Promise((resolve, reject) => {

        const user = UsersStore.users[email];
        if (!user) {
            const boomErrorMsg = Boom.notFound("User do not exist.");
            if (cb) return cb(boomErrorMsg);
            reject(boomErrorMsg);
        } else {
            bcrypt.compare(password, user.passwordhash, (err, isValid) => {
                if (!isValid) {
                    const boomErrorMsg = Boom.unauthorized('Password does not match.');
                    if (cb) return cb(boomErrorMsg);
                    reject(boomErrorMsg);
                } else {
                    if (cb) return cb(null, user);
                    return resolve(user)
                }
            })
        }
    })
}

module.exports = UsersStore;