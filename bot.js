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

let buyers = [];
let sellers = [];

const requireInt = ['buy', 'sell'];
const validCommands = ['buy', 'sell', 'update', 'help', 'hours'];
const errorMsg =
  'Invalid command. Type `!help` to see a list of valid commands.';

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity('everything', { type: 'LISTENING' });
});

client.on('message', message => {
  // Handle command listening
  const prefix = '!';

  if (!message.content.startsWith(prefix)) return;

  const args = message.content
    .slice(prefix.length)
    .trim()
    .split(/ +/g);

  const command = args.shift().toLowerCase();
  if (!validCommands.includes(command)) return;

  let input = 0;
  if (requireInt.includes(command)) {
    if (args.length != 1) return message.reply(errorMsg);

    input = parseInt(args[0]);
    if (isNaN(input)) return message.reply(errorMsg);
  } else if (args.length != 0) return message.reply(errorMsg);

  // Channel
  const channel =
    client.channels.cache.find(c => c.name === 'stalk-market') ||
    message.channel;

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

  if (!isSameDay(storage.low.date, now)) {
    storage.low = initial;
    sellers = [];
  } else if (
    isSameDay(storage.low.date, now) &&
    isAfter(now, noon) &&
    isBefore(storage.low.date, noon)
  ) {
    storage.low = initial;
    sellers = [];
  }

  if (!isSameDay(storage.high.date, now)) {
    storage.high = initial;
    buyers = [];
  } else if (
    isSameDay(storage.high.date, now) &&
    isAfter(now, noon) &&
    isBefore(storage.high.date, noon)
  ) {
    storage.high = initial;
    buyers = [];
  }

  if (command === 'buy') {
    const buyPrice = input;
    if (isSunday(now)) {
      return message.reply(`Sorry, Timmy and Tommy don't buy on Sundays.`);
    } else if (isAfter(now, close)) {
      return message.reply(`Sorry, Timmy and Tommy close at 10PM.`);
    } else {
      if (!buyers.includes(message.author.username))
        buyers.push(message.author.username);
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
        return channel.send(
          `New high! ${message.author.username}'s island is buying for ${buyPrice} bells per turnip.`
        );
      } else {
        return message.reply(
          `Sorry, ${name}'s island is buying higher at ${price} bells per turnip.`
        );
      }
    }
  } else if (command === 'sell') {
    const sellPrice = input;
    if (!isSunday(now)) {
      return message.reply(`Sorry, Daisy Mae only sells on Sundays.`);
    } else if (isAfter(now, noon)) {
      return message.reply(`Sorry, Daisy Mae left at 12PM.`);
    } else {
      if (!sellers.includes(message.author.username))
        sellers.push(message.author.username);
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
        return channel.send(
          `Better price available! Daisy Mae on ${message.author.username}'s island is selling turnips for ${sellPrice} bells per turnip.`
        );
      } else {
        return message.reply(
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
          `These people have submitted prices: ${buyers.join(', ')}`
        );
        message.channel.send(
          `${high.name}'s island is buying turnips for ${high.price} bells per turnip!`
        );
      }
      if (low.set) {
        message.channel.send(
          `These people have submitted prices: ${sellers.join(', ')}`
        );
        cmessage.channel.send(
          `Daisy Mae on ${low.name}'s island is selling turnips for ${low.price} bells per turnip!`
        );
      }
    }
  } else if (command === 'help') {
    let content =
      'Type `!buy <number>` to tell me how much Timmy and Tommy are buying turnips for! Example: `!buy 100`\n' +
      'Type `!sell <number>` to tell me how much Daisy Mae is selling turnips for! Example: `!sell 100`\n' +
      'Type `!update` if you want to know who has the current best prices to buy and sell turnips!\n' +
      'Type `!hours` if you want to know what the hours to are to buy and sell turnips!';
    message.reply(content);
  } else if (command === 'hours') {
    let content =
      `Current server time: ${now}\n` +
      `Daisy Mae hours: Sunday 5AM-12PM\n` +
      `Timmy & Tommy hours: Monday-Saturday, 5AM-12PM/ 12PM-10PM`;
    message.reply(content);
  }
});

client.login(process.env.BOT_TOKEN);
