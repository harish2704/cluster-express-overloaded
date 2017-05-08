let app = global.app
let cache = {}
let Cacheman = require('cacheman');
if (typeof app.config.app.redisCache !== "undefined") {
  let cachemanRedis = require('cacheman-redis')
  let redisEngine = new cachemanRedis(app.config.app.redisCache)
  cache['redis'] = new Cacheman("app", {
    engine: redisEngine,
    ttl: app.config.app.redisCache.ttle
  })
}
if (typeof app.config.app.redisCache !== "undefined") {
  let cachemanFile = require('cacheman-file-cluster') //cacheman-file doesn't support clusters
  let fileEngine = new cachemanFile(app.config.app.fileCache)
  cache['file'] = new Cacheman("app", {
    engine: fileEngine,
    ttl: app.config.app.fileCache.ttle
  })
}
module.exports = cache
