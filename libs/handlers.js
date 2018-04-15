const Joi = require("joi");
const uuid = require("uuid");
const fs = require("fs");
const Boom = require("boom");
const CardsStore = require("./cardsStore");

const cards = CardsStore.cards

const cardSchema = Joi.object().keys({
    name: Joi.string().min(3).max(50).required(),
    recipient_email: Joi.string().email().required(),
    sender_name: Joi.string().min(3).max(50).required(),
    sender_email: Joi.string().email().required(),
    card_image: Joi.string().regex(/.+\.(jpg|bmp|png|gif)\b/).required()
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
    return h.view("cards", { cards: cards });
}

// private functin



function saveCard(card) {
    const id = uuid.v1();
    card.id = id;
    cards[id] = card;
}

function loadImages() {
    return fs.readdirSync("./public/images/cards")
}

module.exports = Handlers;