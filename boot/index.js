var requireDirectory = require('require-directory');
boot = {}
boot.config = requireDirectory(module, './../config');
boot.override = requireDirectory(module, './../override');
boot.components = requireDirectory(module, './../components')
console.log(boot);
module.exports = boot
