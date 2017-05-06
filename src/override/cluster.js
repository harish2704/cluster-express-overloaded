// app must be able to receive messages from master
let app = global.app
process.on('message', (msg) => {
  app.log.info('Message received', msg)
  app.emit('message', msg)
})
