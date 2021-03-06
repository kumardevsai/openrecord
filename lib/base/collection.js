/*
 * MODEL
 */
exports.model = {
  /**
   * Initialize a new Record.
   * You could either use
   * ```js
   * var records = new Model();
   * ```
   * @or
   * ```js
   * var records = Model.new();
   * ```
   *
   * @class Model
   * @method new
   * @param {object} attributes - Optional: The records attributes
   *
   * @return {Record}
   */
  'new': function(data, castType){
    data = data || {}

    // if it's already a record
    if(data.definition && data._exists){
      if(this.add) this.add(data)
      return data
    }

    if(this.chained){
      var record = this.model.new()
      if(this.definition.temporary){
        record.definition = this.definition
      }

      record.__chained_model = this
      record.set(data, castType)

      this.add(record)

      return record
    }

    return new this(data, castType)
  }
}





/*
 * CHAIN
 */
exports.chain = {

  /**
   * Adds new Records to the collection
   *
   * @class Collection
   * @method add
   * @param {array} Record - Either an object which will be transformed into a new Record, or an existing Record
   *
   * @return {Collection}
   */
  add: function(records){
    var self = this.chain()
    var relation = self.getInternal('relation')
    var parentRecord = self.getInternal('relation_to')

    if(!Array.isArray(records)) records = [records]

    for(var i = 0; i < records.length; i++){
      var record = records[i]
      if(record && typeof record === 'object'){
        if(self.options.polymorph){
          if(!(record instanceof record.model)) continue
        }else{
          if(!(record instanceof self.model)) record = self.model.new(record)
        }

        self.push(record)

        if(relation && parentRecord){
          self.definition.emit('relation_record_added', parentRecord, relation, record)
        }
      }
    }

    return self
  },

  /**
   * Removes a Record from the Collection
   *
   * @class Collection
   * @method remove
   * @param {integer} index - Removes the Record on the given index
   * @or
   * @param {Record} record - Removes given Record from the Collection
   *
   * @return {Collection}
   */
  remove: function(index){
    var self = this.chain()

    if(typeof index !== 'number'){
      index = self.indexOf(index)
    }

    self.splice(index, 1)

    return self
  },



  clear: function(){
    var self = this.chain()

    self.splice(0, self.length)

    return self
  },


  /**
   * Returns the first Record in the Collection
   *
   * @class Collection
   * @method first
   *
   * @return {Record}
   */
  first: function(){
    return this[0]
  },

  /**
   * Returns the last Record in the Collection
   *
   * @class Collection
   * @method last
   *
   * @return {Record}
   */
  last: function(){
    return this[this.length - 1]
  },


  /**
   * Creates a temporary definition object, that lives only in the current collection.
   * This is usefull if you need special converters that's only active in a certain scope.
   *
   * @class Collection
   * @method temporaryDefinition
    * @param {function} fn - Optional function with the definition scope
   *
   * @return {Definition}
   */
  __temporary_definition_attributes: ['attributes', 'interceptors', 'relations', 'validations'],

  temporaryDefinition: function(fn){
    var tmp = {temporary: true}

    if(this.definition.temporary){
      return this.definition
    }

    for(var name in this.definition){
      var prop = this.definition[name]

      if(this.__temporary_definition_attributes.indexOf(name) !== -1){
        tmp[name] = this.definition.store.utils.clone(prop)
        continue
      }

      tmp[name] = prop
    }

    Object.defineProperty(this, 'definition', {
      enumerable: false,
      value: tmp
    })

    if(typeof fn === 'function'){
      fn.call(this.definition)
    }

    return this.definition
  }
}
