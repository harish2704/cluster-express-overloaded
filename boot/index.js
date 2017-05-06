var requireDirectory = require('require-directory');
var onlyjs = /.js$/
var boot = {}

boot.config = requireDirectory(module, './../config');
boot.override = requireDirectory(module, './../override', {include: onlyjs});
boot.components = requireDirectory(module, './../components', {include: onlyjs})
boot.routes = requireDirectory(module, './../routes', {include: onlyjs})
module.exports = boot
