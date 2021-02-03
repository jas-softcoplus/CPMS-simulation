const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 2801 });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    //console.log('received: %s', message);
    var request = JSON.parse(message)
   console.log(request)

  });

});

