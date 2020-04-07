const { isSameDay, isSunday, set, isAfter, isBefore } = require('date-fns');
const { Client } = require('discord.js');
const client = new Client();

const initial = {
  name: 'nobody',
  price: 0,
  date: new Date(2019, 1, 1),
  set: false
};

let storage = {
  low: initial, // Daisy Mae sells
  high: initial // Timmy & Tommy buys
};

const errorMsg = 'Sorry! Something went wrong. Yell at Brian.';

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

  // Reset prices
  let now = new Date();
  let noon = set(now, {
    hours: 12,
    minutes: 0,
    seconds: 0,
    milliseconds: 0
  });
  let close = set(now, {
    hours: 22,
    minutes: 0,
    seconds: 0,
    milliseconds: 0
  });

  if (!isSameDay(storage.low.date, now)) storage.low = initial;
  else if (
    isSameDay(storage.low.date, now) &&
    isAfter(now, noon) &&
    isBefore(storage.low.date, noon)
  )
    storage.low = initial;

  if (!isSameDay(storage.high.date, now)) storage.high = initial;
  else if (
    isSameDay(storage.high.date, now) &&
    isAfter(now, noon) &&
    isBefore(storage.high.date, noon)
  )
    storage.high = initial;

  if (command === 'buy') {
    const buyPrice = parseInt(args[0]);
    if (isNaN(buyPrice)) {
      return message.reply(errorMsg);
    } else if (isSunday(now)) {
      return message.reply(`Sorry, Timmy and Tommy don't buy on Sundays.`);
    } else if (isAfter(now, close)) {
      return message.reply(`Sorry, Timmy and Tommy close at 10PM.`);
    } else {
      const {
        high: { name, price }
      } = storage;
      if (buyPrice >= price) {
        storage = {
          ...storage,
          high: {
            name: message.author.username,
            price: buyPrice,
            date: now,
            set: true
          }
        };
        return message.channel.send(
          `New high! ${message.author.username}'s island is buying for ${buyPrice} bells per turnip.`
        );
      } else {
        return message.channel.send(
          `Sorry, ${name}'s island is buying higher at ${price} bells per turnip.`
        );
      }
    }
  } else if (command === 'sell') {
    const sellPrice = parseInt(args[0]);
    if (isNaN(sellPrice)) {
      return message.reply(errorMsg);
    } else if (!isSunday(now)) {
      return message.reply(`Sorry, Daisy Mae only sells on Sundays.`);
    } else if (isAfter(now, noon)) {
      return message.reply(`Sorry, Daisy Mae left at 12PM.`);
    } else {
      const {
        low: { name, price }
      } = storage;
      if (price >= sellPrice) {
        storage = {
          ...storage,
          low: {
            name: message.author.username,
            price: sellPrice,
            date: now,
            set: true
          }
        };
        return message.channel.send(
          `Better price available! Daisy Mae on ${message.author.username}'s island is selling turnips for ${sellPrice} bells per turnip.`
        );
      } else {
        return message.channel.send(
          `Sorry, better price at ${name}'s island, Daisy Mae is selling turnips for ${price} bells per turnip.`
        );
      }
    }
  } else if (command === 'update') {
    const { high, low } = storage;
    if (!high.set && !low.set) {
      message.channel.send(`The prices for today have not been set.`);
    } else {
      if (high.set) {
        message.channel.send(
          `${high.name}'s island is buying turnips for ${high.price} bells per turnip!`
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
