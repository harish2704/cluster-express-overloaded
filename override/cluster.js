process.on('message', function(msg) {
  app.log.info("Message received", msg)
  app.emit('message', msg)
});
