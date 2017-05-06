var express = require('express')
var router = express.Router()
/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', {title: 'Express'})
})
router.for = '/' // This tells where to mount. Instead of using simply here app.use, it is better to still keep the room for multiple mounts.
module.exports = router
