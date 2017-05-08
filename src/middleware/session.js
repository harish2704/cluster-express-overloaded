let app = global.app
var session = require('express-session')
var RedisStore = require('connect-redis')(session)
// redis session
if (typeof app.config.app.redisSession !== "undefined") {
  app.use(session({
    store: new RedisStore(app.config.app.redisSession),
    secret: app.config.app.secret
  }))
}
