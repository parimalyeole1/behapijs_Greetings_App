"use strict";

const Hapi = require("hapi");
const Path = require("path");

const CardsStore = require("./libs/cardsStore");
const UsersStore = require("./libs/usersStore");

const server = Hapi.server({
  port: 3000,
  host: "localhost"
});

CardsStore.initialize();
// UsersStore.initialize();

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
  try {
    await server.register(require("inert"));
    await server.register(require('vision'));
    await server.register(require('hapi-auth-cookie'));
    await UsersStore.initialize();

    server.auth.strategy("default", "cookie", {
      password: "minimum-32-characters-password1234567890",
      redirectTo: "/login",
      isSecure: false
    });

    server.auth.default("default");

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

  } catch (error) {

    console.log("Error at Method ServerInit ==>", error)
  }
};

process.on("unhandledRejection", err => {
  console.log(err);
  process.exit(1);
});
process.on("uncaughtException", err => {
  console.log(err);
  process.exit(1);
});



ServerInit();
