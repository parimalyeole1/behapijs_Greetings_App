"use strict";

const Hapi = require("hapi");
const Inert = require("inert");
const Path = require("path");

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
    method: "GET",
    path: "/cards",
    handler: cardsHandler
  });

  server.route({
    method: ["GET", "POST"],
    path: "/cards/new",
    handler: newCardHandler
  });

  function newCardHandler(request, h) {
    if (request.method === "get") {
      return h.file("templates/new.html");
    } else {
      // TODO: bussiness logic
      return h.redirect("/cards");
    }
  }

  function cardsHandler(request, h) {
    return h.file("templates/cards.html");
  }
  await server.start();

  console.log("Server running at:", server.info.uri);
};

process.on("unhandledRejection", err => {
  console.log(err);
  process.exit(1);
});

ServerInit();
