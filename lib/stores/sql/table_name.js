const inflection = require('inflection')

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.table_name = inflection.underscore(inflection.pluralize(this.model_name))

    if(this.store.config.inflection && this.store.config.inflection[this.table_name]){
      this.table_name = this.store.config.inflection[this.table_name]
    }
  },

  getName: function(){
    return this.table_name
  }
}


/*
 * STORE
 */
exports.store = {
  getByTableName: function(tableName){
    for(var i in this.models){
      if(this.models[i].definition.table_name === tableName){
        return this.models[i]
      }
    }
  }
}
