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
    },
    {
        path: '/login',
        method: 'POST',
        handler: Handlers.loginHandler,
        config: {
            auth: false
        }
    },
    {
        path: '/logout',
        method: 'GET',
        handler: Handlers.logoutHandler
    },
    {
        path: '/register',
        method: 'GET',
        handler: {
            file: 'templates/register.html'
        },
        config: {
            auth: false
        }
    },
    {
        path: '/register',
        method: 'POST',
        handler: Handlers.registerHandler,
        config: {
            auth: false
        }
    },
    {
        path: '/upload',
        method: 'GET',
        handler: {
            file: 'templates/upload.html'
        }
    },
    {
        path: '/upload',
        method: 'POST',
        handler: Handlers.uploadHandler,
        config: {
            payload: {
                output: 'file',
                uploads: 'public/images'
            }
        }
    }
];

module.exports = Routes;
