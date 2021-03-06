import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
const app = express();
app.use(express.static(process.cwd()));
import * as http from 'http';
import redis from 'redis';
const client = redis.createClient();
const server = http.createServer(app);

// connect redis server
client.on("error", function(error) {
  console.error(error);
});

app.get('/redis/example', (request, response) => {

  client.set("redisKey", "this is value from redis", redis.print);
  client.get("redisKey", (err, rawdata) => {
    // err handle
    if (err) {
      console.log(err)
    }
    // check redis has value
    if (!!rawdata) {
      console.log(rawdata);
      return response.json({
        message: rawdata,
      });
    }
  });
});

app.get('/redis/json', (request, response) => {
  
  const arr = [1,2,3];

  client.set("redisJson", JSON.stringify(arr), redis.print);
  client.get("redisJson", (err, rawdata) => {
    // err handle
    if (err) {
      console.log(err)
    }
    // check redis has value
    if (!!rawdata) {
      console.log(rawdata);
      return response.json({
        message: JSON.parse(rawdata),
      });
    }
  });
});

/* hmset */
app.get('/redis/hmset', (request, response) => {
  
  client.hmset("kitty", {
    'age': '2-year-old',
    'sex': 'male'
  }, redis.print);
  client.hgetall("kitty", (err, rawdata) => {
    // err handle
    if (err) {
      console.log(err)
    }
    // check redis has value
    if (!!rawdata) {
      console.log(rawdata);
      return response.json({
        message: rawdata,
      });
    }
  });

});

/* hget */
app.get('/redis/hget', (request, response) => {
  
  client.hget('kitty', 'age', function(err, value) {
    // err handle
    if (err) {
      console.log(err)
    }
    console.log('kitty is ' + value);
    // check redis has value
    if (!!value) {
      return response.json({
        message: value,
      });
    }
  });

});

/* hkeys */
app.get('/redis/hkeys', (request, response) => {
  
  client.hkeys('kitty', function(err, keys) {
    // err handle
    if (err) {
      console.log(err)
    }
    keys.forEach(function(key, i) {
      console.log(key, i);
    });
    client.quit();
    // check redis has value
    if (!!keys) {
      return response.json({
        message: keys,
      });
    }
  });
});

/* ??????(lpush, lrange) */
/* 
Redis????????????JS?????????lpush????????????????????????lrange????????????start???end????????????????????????, ??????end???-1??????????????????????????????????????????
?????????????????????????????????????????????????????????????????????
*/
app.get('/redis/tasks', (request, response) => {

  client.lpush('tasks', 'Paint the house red.', redis.print);

  client.lpush('tasks', 'Paint the house green.', redis.print);

  client.lrange('tasks', 0, -1, function(err, items) {
    // err handle
    if (err) {
      console.log(err)
    }
    items.forEach(function(item, i) {
      console.log(' ' + item);
    });
    client.quit();
    // check redis has value
    if (!!items) {
      return response.json({
        message: items,
      });
    }
  });

});

/* ??????(sadd, smembers) */
/* ??????JS??????Set??????????????????????????????????????? */
app.get('/redis/members', (request, response) => {

  client.sadd('ip', '192.168.3.7', redis.print);
  client.sadd('ip', '192.168.3.7', redis.print);
  client.sadd('ip', '192.168.3.9', redis.print);
  client.smembers('ip', function(err, members) {
    // err handle
    if (err) {
      console.log(err)
    }
    console.log(members);
    client.quit();
    if (!!members) {
      return response.json({
        message: members,
      });
    }
  });

});

/* ?????? */
/*
????????????/???????????????
clientA?????????main_chat_room?????????clientA?????????????????????????????????????????????clientB???main_chat_room?????????????????????Hello world!
clientA????????????????????????????????????????????????????????????
*/
var clientA = redis.createClient(6379, '127.0.0.1')
var clientB = redis.createClient(6379, '127.0.0.1')

app.get('/redis/message', (request, response) => {

  clientA.on('message', function(channel, message) {
    if (channel && message) {
      const responseMessage = 'Client A got message from channel: ' + channel + ',' + message;
      return response.json({
        message: responseMessage,
      });
    }
  });
  clientA.on('subscribe', function(channel, count) {
    clientB.publish('main_chat_room', 'Hello world!');
  });
  clientA.subscribe('main_chat_room');

})

app.get('/*', (request, response) => {
  response.json({
    message: 'Hello World',
  });
});

server.listen(process.env.PORT, () => console.log('start!'));