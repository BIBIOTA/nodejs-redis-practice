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

app.get('/*', (request, response) => {
  response.json({
    message: 'Hello World',
  });
});

server.listen(process.env.PORT, () => console.log('start!'));