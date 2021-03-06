
/*
 * CHAIN
 */
exports.chain = {
  _create: function(options){
    const Store = require('../../store')

    var self = this
    var query = this.definition.query(options)

    // get all new records
    const newRecords = this.filter(function(record){
      return !record.__exists
    })

    return Promise.all(newRecords.map(function(record){
      return record.callInterceptors('beforeSave', [record, options])
      .then(function(){
        return record.callInterceptors('beforeCreate', [record, options])
      })
    }))
    .then(function(){
      return Promise.all(newRecords.map(function(record){
        return record.callInterceptors('afterCreate', [record, options])
      }))
    })
    .then(function(){
      // now save all records with a single `INSERT`
      var primaryKeys = self.definition.primaryKeys
      var primaryKey = primaryKeys[0] // TODO multiple primary keys?!?!
      var values = self.map(function(record){
        var changes = record.getChangedValues()
        var value = {}
        for(var name in self.definition.attributes){
          var attr = self.definition.attributes[name]

          if(attr.persistent && changes.hasOwnProperty(name)){
            value[name] = self.definition.cast(name, changes[name], 'write', record)
          }
        }
        return value
      })
      
      return query
      .returning(primaryKey)
      .insert(values)
      .catch(function(error){
        self.logger.warn(query.toString())
        throw new Store.SQLError(error)
      })
      .then(function(result){
        self.logger.info(query.toString())

        self.forEach(function(record, index){
          var idTmp = {}
          idTmp[primaryKey] = result[index]

          record.__exists = true
          record.set(idTmp, 'read')

          // eliminate changes -> we just saved it to the database!
          record.changes = {}
        })        
      })
    })
    .then(function(){
      return Promise.all(newRecords.map(function(record){
        return record.callInterceptors('afterCreate', [record, options])
        .then(function(){
          return record.callInterceptors('afterSave', [record, options])
        })
      }))
    })
  }
}