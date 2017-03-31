'use strict';

const restify = require('restify');
const host = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || '8080';

require('./lib/utils/logger.js');
const nodeModel = require('./lib/node');

const node = new nodeModel();

const gracefulShutdown = function() {
	console.log('');
    console.error("xxx", "sys", "Received kill signal, shutting down gracefully.");

    node.stop();
    console.info("xxx", "sys", "Closed node watcher");

    setTimeout(function(){
        console.info("xxx", "sys", "Closed out remaining connections.");
        process.exit(0);
    }, 1000);
}

//// This is the standard process handling.
// listen for TERM signal .e.g. kill
process.on('SIGTERM', gracefulShutdown);

// listen for INT signal e.g. Ctrl-C
process.on('SIGINT', gracefulShutdown);

// listen for shutdown signal from pm2
process.on('message', function(msg) {
	if (msg == 'shutdown')
		gracefulShutdown();
});

//// TODO: this is the API Restify parts
const server = restify.createServer({
  name: 'Ethereum client status server'
});
 
server.use(restify.queryParser());
// server.use(restify.bodyParser()); // don't need this.
 
server.use(function logger(req,res,next) {
  console.log(new Date(),req.method,req.url);
  //// TODO: check for valid API key ????
  next();
});
 
server.on('uncaughtException',function(request, response, route, error){
  console.error(error.stack);
  response.send(error);
});
 
server.listen(port,host, function() {
  console.log('%s listening at %s', server.name, server.url);
});

server.get('/status',function(req,res){
  let currentStats = node.currentStats();
  res.json(currentStats);
});


//module.exports = node;
