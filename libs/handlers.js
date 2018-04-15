const Joi = require("joi");
const uuid = require("uuid");
const fs = require("fs");
const Boom = require("boom");
const CardsStore = require("./cardsStore");
const UsersStore = require("./usersStore");

const cards = CardsStore.cards

const cardSchema = Joi.object().keys({
    name: Joi.string().min(3).max(50).required(),
    recipient_email: Joi.string().email().required(),
    sender_name: Joi.string().min(3).max(50).required(),
    sender_email: Joi.string().email().required(),
    card_image: Joi.string().regex(/.+\.(jpg|bmp|png|gif)\b/).required()
});

const loginSchema = Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().max(32).required()
});

const registerSchema = Joi.object().keys({
    name: Joi.string().max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().max(32).required()
});


const Handlers = {}

Handlers.deleteCardHandler = (request, h) => {
    delete cards[request.params.id];
    return h.response().code(200);
}

Handlers.newCardHandler = (request, h) => {
    if (request.method === "get") {
        //return h.file("templates/new.html");
        return h.view("new", { card_images: loadImages() });
    } else {
        return Joi.validate(request.payload, cardSchema, function (err, val) {
            if (err) {
                return Boom.badRequest(err.details[0].message)
            }
            var card = {
                name: val.name,
                recipient_email: val.recipient_email,
                sender_name: val.sender_name,
                sender_email: val.sender_email,
                card_image: val.card_image
            };
            saveCard(card);
            return h.redirect('/cards');
        });
    }
}

Handlers.cardsHandler = (request, h) => {
    return h.view("cards", { cards: getCards(request.auth.credentials.email) });
}

Handlers.loginHandler = function (request, h) {
    const joiResult = Joi.validate(request.payload, loginSchema);
    if (joiResult.error) {
        return Boom.unauthorized('Credentials did not validate');
    } else {
        return UsersStore.validateUser(joiResult.value.email, joiResult.value.password)
            .then(function (user) {
                request.cookieAuth.set(user);
                return h.redirect('/cards');
            }).catch((err) => {
                return h.response(err);
            })
    }
};

Handlers.logoutHandler = function (request, h) {
    request.cookieAuth.clear();
    return h.redirect('/');
};

Handlers.registerHandler = function (request, h) {

    const joiResult = Joi.validate(request.payload, registerSchema);
    if (joiResult.error) {
        return Boom.unauthorized('Credentials did not validate');
    } else {
        return UsersStore
            .createUser(joiResult.value.name, joiResult.value.email, joiResult.value.password)
            .then(function (user) {
                return h.redirect('/cards');
            }).catch((err) => {
                return Boom.badRequest();
            });
    }
};

// private functin
function saveCard(card) {
    const id = uuid.v1();
    card.id = id;
    cards[id] = card;
}

function getCards(email) {
    const collectCards = [];
    for (let key in cards) {
        if (cards[key].sender_email === email) {
            collectCards.push(cards[key]);
        }
    }
    return collectCards;
}

function loadImages() {
    return fs.readdirSync("./public/images/cards")
}

module.exports = Handlers;