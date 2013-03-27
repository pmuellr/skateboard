var Stream = require('stream').Stream;
    util = require('util')

function Skateboard(socket) {
  Stream.apply(this, arguments);

  this.socket = socket;
  this.readable = true;
  this.writable = true;

  var that = this;

  var on = function(name, fn) {
    if (socket.on) {
      socket.on(name, fn);
    } else {
      socket['on' + name] = fn;
    }
  };

  on('message', function(message) {
    if (message && message.srcElement && message instanceof MessageEvent) {
      message = message.data;
    } else if (typeof message.initMessageEvent === 'function') {
      message = message.data;
    }

    that.emit('data', message);
  });

  on('close', function() {
    that.emit('end');
  });

  on('error', function(err) {
    that.emit('error', err);
  });

  var handleConnection = function() {
    that.emit('connection');
  };

  on('open', handleConnection);
  on('connection', handleConnection);
}

util.inherits(Skateboard, Stream);

Skateboard.prototype.write = function(d) {
  try {
    if (this.socket.write) {
      this.socket.write(d);
    } else {
      this.socket.send(d);
    }
  } catch (e) {
    this.emit('error', e);
  }
};

Skateboard.prototype.end = function() {
  this.emit('end');
};

module.exports = Skateboard;