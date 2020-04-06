const { Client } = require('discord.js');
const client = new Client();

let storage = {
  low: {
    name: 'nobody',
    price: 100000,
    set: false
  },
  high: {
    name: 'nobody',
    price: -100000,
    set: false
  }
};

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
  const prefix = '!';
  const args = message.content
    .slice(prefix.length)
    .trim()
    .split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === 'buy') {
    const buyPrice = parseInt(args[0]);
    if (isNaN(buyPrice)) {
      return message.reply('Sorry! Something went wrong');
    } else {
      const {
        high: { name, price }
      } = storage;
      if (buyPrice >= price) {
        storage = {
          ...storage,
          high: { name: message.author.username, price: buyPrice, set: true }
        };
        return message.channel.send(
          `${message.author.username}'s island is buying for ${buyPrice} bells per turnip`
        );
      } else {
        return message.channel.send(
          `${name}'s island is buying for ${price} bells per turnip`
        );
      }
    }
  } else if (command === 'sell') {
    const sellPrice = parseInt(args[0]);
    if (isNaN(sellPrice)) {
      return message.reply('Sorry! Something went wrong');
    } else {
      const {
        low: { name, price }
      } = storage;
      if (price >= sellPrice) {
        storage = {
          ...storage,
          low: { name: message.author.username, price: sellPrice, set: true }
        };
        return message.channel.send(
          `Daisy Mae on ${message.author.username}'s island is selling turnips for ${sellPrice} bells per turnip`
        );
      } else {
        return message.channel.send(
          `Daisy Mae on ${name}'s island is selling turnips for ${price} bells per turnip`
        );
      }
    }
  } else if (command === 'update') {
    const { high, low } = storage;
    if (!high.set && !low.set) {
      message.channel.send('The prices for this week have not been set');
    } else {
      if (high.set) {
        message.channel.send(
          `${high.name}'s island is paying ${high.price} bells per turnip!`
        );
      }
      if (low.set) {
        message.channel.send(
          `Daisy Mae on ${low.name}'s island is selling turnips for ${low.price} bells per turnip!`
        );
      }
    }
  } else if (command === 'help') {
    message.reply(
      'Type `!buy <number>` to tell me how much Timmy and Tommy are buying turnips for! Example: `!buy 100`'
    );
    message.reply(
      'Type `!sell <number>` to tell me how much Daisy Mae is selling turnips for! Example: `!sell 100`'
    );
    message.reply(
      'Type `!update` if you want to know who has the current best prices to buy and sell turnips!'
    );
  }
});

client.login(process.env.BOT_TOKEN);
