const fs = require("fs");
const CardsStore = {};

CardsStore.cards = {};

CardsStore.initialize = function () {
    CardsStore.cards = loadCards()
}

function loadCards() {
    const file = fs.readFileSync('./cards.json');
    return JSON.parse(file.toString());
}

module.exports = CardsStore;