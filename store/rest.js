const Store = require('../lib/store')

Store.registeredTypes.rest = require('../lib/base').concat(
  require('../lib/persistence'),
  require('../lib/stores/rest')
)

module.exports = function(config){
  config.type = 'rest'
  return new Store(config)
}
