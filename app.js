var http = require('http'),
    , stack = require('stack'),
    , creationix = require('creationix'),
    , xmlrpc = require('xmlrpc');

var client = xmlrpc.createClient({
  host: 'localhost',
  port: 8760,
  path: '/',
  basic_auth: {user: 'hellanzb', pass: 'changeme'}
});

var vfs = require('vfs-local')({
  root: __dirname + "/public"
});

var server = http.createServer(stack(
  creationix.log(),
  function(req, res, next) {
    if(req.url === '/') {
      req.url = '/index.html';
    }
    next();
    return;
  },
  require('vfs-http-adapter')("/", vfs)
)).listen(8080, function() {
  console.log("Listening at http://localhost:8080");
});

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {

  setInterval(function sendStatus() {

    client.methodCall('status', [], function (error, value) {
      if(typeof error != 'undefined') {
        socket.emit('status', { rate: 0 });
        return;
      }

      socket.emit('status', { rate: value.rate });
    });

  }, 1000);

});
