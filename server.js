"use strict";

const Hapi = require("hapi");
const Path = require("path");
const uuid = require("uuid");

const cards = {};

const server = Hapi.server({
  port: 3000,
  host: "localhost"
});

server.ext("onRequest", (request, h) => {
  console.log(`Request url on hapi server :: ${request.path}`);
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
      // TODO: improve this logic and move handle in handlers 
      delete cards[request.params.id]
    }
  });


  function newCardHandler(request, h) {
    if (request.method === "get") {
      //return h.file("templates/new.html");
      return h.view("new");
    } else {
      const card = {
        name: request.payload.name,
        recipient_email: request.payload.recipient_email,
        sender_name: request.payload.sender_name,
        sender_email: request.payload.sender_email,
        card_image: request.payload.card_image
      }
      saveCards(card);
      console.log(card);
      return h.redirect("/cards");
    }
  }

  function cardsHandler(request, h) {
    return h.file("templates/cards.html");
  }

  function saveCards(card) {
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

ServerInit();
