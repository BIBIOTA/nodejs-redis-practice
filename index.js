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

/* 鍵表(lpush, lrange) */
/* 
Redis鏈表類似JS數組，lpush向鏈表中添加值，lrange獲取參數start和end范圍內的鏈表元素, 參數end為-1，表明到鏈表中最後一個元素。
注意：隨著鏈表長度的增長，數據獲取也會逐漸變慢
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

/* 集合(sadd, smembers) */
/* 類似JS中的Set，集合中的元素必須是唯一的 */
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

/* 信道 */
/*
提供發布/預定功能。
clientA訂閱了main_chat_room，這時clientA捕獲到訂閱事件，執行回調函數，clientB向main_chat_room發送了一條信息Hello world!
clientA接受到信息後，在控制台打印出了相關信息。
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