const Store = require('../lib/store')

Store.registeredTypes.activedirectory = require('../lib/base').concat(
  require('../lib/persistence'),
  require('../lib/stores/ldap'),
  require('../lib/stores/activedirectory')
)

module.exports = function(config){
  config.type = 'activedirectory'
  return new Store(config)
}
