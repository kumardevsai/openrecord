/*
 * MODEL
 */
exports.model = {

  /**
   * Specify SQL group fields.
   * @class Model
   * @method group
   * @param {array} fields - The field names
   *
   *
   * @return {Model}
   */
  group: function(){
    var self = this.chain()

    var args = this.definition.store.utils.args(arguments)
    var fields = []
    fields = fields.concat.apply(fields, args) // flatten

    self.addInternal('group', fields)
    self.asRaw()

    return self
  },


  /**
   * SQL Having conditions
   * @class Model
   * @method having
   * @param {object} conditions - every key-value pair will be translated into a condition
   * @or
   * @param {array} conditions - The first element must be a condition string with optional placeholder (?), the following params will replace this placeholders
   *
   * @return {Model}
   */
  having: function(){
    const Utils = this.definition.store.utils
    var self = this.chain()
    var args = Utils.args(arguments)

    var conditions = Utils.sanitizeConditions(this, args)

    self.addInternal('having', conditions)

    return self
  }
}


/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this

    this.beforeFind(function(query){
      var group = this.getInternal('group')
      var select = this.getInternal('select')
      var having = this.getInternal('having')
      var i

      if(group){
        if(!select){
          this.select(group)
        }

        for(i = 0; i < group.length; i++){
          var tmp = group[i]

          // check for function calls => don't escape them!
          if(tmp.match(/(\(|\))/)){
            tmp = self.store.connection.raw(tmp)
          }

          query.groupBy(tmp)
        }

        this.asJson()


        if(having){
          var calls = []
          var chain = this

          for(i = 0; i < having.length; i++){
            if(!having[i]) continue;

            (function(having){
              calls.push(function(){
                // this is a workaround to get knex's having to work with promises
                var promise
                if(having.type === 'hash'){
                  promise = chain.callInterceptors('onHashCondition', [chain, having])
                }else{
                  promise = chain.callInterceptors('onRawCondition', [chain, having])
                }

                return promise.then(function(fns){
                  return query.having(function(){
                    var self = this
                    fns.forEach(function(fn){
                      if(typeof fn === 'function'){
                        fn(self)
                      }
                    })
                  })
                })
              })
            })(having[i])
          }


          return this.store.utils.parallel(calls)
        }
      }
    }, -45)
  }
}
