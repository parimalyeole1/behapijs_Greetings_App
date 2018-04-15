const Handlers = require("./handlers.js");
const Routes = [
    {
        method: "GET",
        path: "/",
        handler: {
            file: "templates/index.html"
        },
        config: {
            auth: false
        }
    },
    {
        method: "GET",
        path: "/assets/{path*}",
        handler: {
            directory: {
                path: "./public",
                listing: false
            }
        },
        config: {
            auth: false
        }
    },
    {
        method: ["GET", "POST"],
        path: "/cards/new",
        handler: Handlers.newCardHandler
    },
    {
        method: "GET",
        path: "/cards",
        handler: Handlers.cardsHandler
    },
    {
        method: "DELETE",
        path: "/cards/{id}",
        handler: Handlers.deleteCardHandler
    },
    {
        method: "GET",
        path: "/login",
        handler: {
            file: "templates/login.html"
        },
        config: {
            auth: false
        }
    }
];

module.exports = Routes;
