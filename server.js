"use strict";

const Hapi = require("hapi");
const Path = require("path");

const CardsStore = require("./libs/cardsStore");


const server = Hapi.server({
  port: 3000,
  host: "localhost"
});

CardsStore.initialize();

server.ext("onRequest", (request, h) => {
  console.log(`ext onRequest handler running ...
  Request url on hapi server :: ${request.path}
  `);
  return h.continue;
});

server.ext("onPreResponse", (request, h) => {
  console.log(`ext onPreResponse handler running ...`);
  if (request.response.isBoom) {
    return h.view("error", request.response);
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
  server.route(require("./libs/routes"));
  await server.start();
  console.log("Server running at:", server.info.uri);
};

process.on("unhandledRejection", err => {
  console.log(err);
  process.exit(1);
});

ServerInit();
