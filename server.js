"use strict";

const Hapi = require("hapi");
const Path = require("path");
const uuid = require("uuid");
const fs = require("fs");
const Joi = require("joi");
const Boom = require("boom");

const cards = loadCards();

const server = Hapi.server({
  port: 3000,
  host: "localhost"
});

server.ext("onRequest", (request, h) => {
  console.log(`ext onRequest handler running ...
  Request url on hapi server :: ${request.path}
  `);
  return h.continue;
});

server.ext("onPreResponse", (request, h) => {
  console.log(`ext onPreResponse handler running ...`);
  if(request.response.isBoom){
    return h.view("error",request.response);
  }
  return h.continue;
});

const ServerInit = async () => {
  await server.register(require("inert"));
  await server.register(require('vision'));

  server.views({
    engines: {
      html: require('handlebars')
    },
    relativeTo: __dirname,
    path: 'templates'
  });

  server.route({
    method: "GET",
    path: "/",
    handler: {
      file: "templates/index.html"
    }
  });

  server.route({
    method: "GET",
    path: "/assets/{path*}",
    handler: {
      directory: {
        path: "./public",
        listing: false
      }
    }
  });

  server.route({
    method: ["GET", "POST"],
    path: "/cards/new",
    handler: newCardHandler
  });

  server.route({
    method: "GET",
    path: "/cards",
    handler: cardsHandler
  });

  server.route({
    method: "DELETE",
    path: "/cards/{id}",
    handler: function deleteCardHandler(request, h) {
      delete cards[request.params.id];
      return h.response().code(200);
    }
  });

  const cardSchema = Joi.object().keys({
    name: Joi.string().min(3).max(50).required(),
    recipient_email: Joi.string().email().required(),
    sender_name: Joi.string().min(3).max(50).required(),
    sender_email: Joi.string().email().required(),
    card_image: Joi.string().regex(/.+\.(jpg|bmp|png|gif)\b/).required()
  });


  function newCardHandler(request, h) {
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

  function cardsHandler(request, h) {
    return h.view("cards", { cards: cards });
  }

  function saveCard(card) {
    const id = uuid.v1();
    card.id = id;
    cards[id] = card;
  }

  await server.start();

  console.log("Server running at:", server.info.uri);
};

process.on("unhandledRejection", err => {
  console.log(err);
  process.exit(1);
});


function loadCards() {
  const file = fs.readFileSync('./cards.json');
  return JSON.parse(file.toString());
}

function loadImages() {
  return fs.readdirSync("./public/images/cards")
}

ServerInit();
