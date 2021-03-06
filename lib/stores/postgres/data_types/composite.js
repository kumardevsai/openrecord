exports.store = {

  mixinCallback: function(){
    this.addType('composite', {
      input: function(val, attribute){
        if(val instanceof Object) return this.definition.attributes[attribute].dynamicType.new(val)
        return val
      },

      read: function(val, attribute){
        if(val instanceof Object) return val
        return parse(val, this.definition.attributes[attribute], true)
      },

      write: function(object, attribute){
        if(object === null) return null
        if(typeof object === 'string') return object

        return format(object, this.definition.attributes[attribute])
      }
    })
  }
}


function parse(str, def, existing){
  var result = {}
  if(str){
    var parts = str.replace(/(^\(|\)$)/g, '').split(',')

    def.attributes.forEach(function(attr, index){
      result[attr] = parts[index].replace(/(^"|"$)/g, '') // remove quotes - added by postgres for string with special chars or blanks
    })
  }

  const record = def.dynamicType.new(result)
  if(existing) record._exists()

  return record
}


function format(data, def){
  var result = []

  def.attributes.forEach(function(attr){
    result.push(data[attr])
  })

  return '(' + result.join(',') + ')'
}
