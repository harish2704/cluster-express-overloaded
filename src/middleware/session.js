let app = global.app
var session = require('express-session')
var RedisStore = require('connect-redis')(session)
// redis session
if (app.config.app.redisSession) {
  app.use(session({
    store: new RedisStore(app.config.app.redisSession),
    secret: app.config.app.secret
  }))
}
