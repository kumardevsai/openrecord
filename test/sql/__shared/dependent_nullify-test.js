var should = require('should');
var Store = require('../../../lib/store');


module.exports = function(title, beforeFn, afterFn, store_conf){
  
  describe(title + ': Nullify dependent', function(){
    var store;
  
    before(beforeFn);
    after(function(next){
      afterFn(next, store);
    });
  
  
    before(function(){
      store = new Store(store_conf);
      store.setMaxListeners(0);
      
      store.Model('User', function(){
        this.hasMany('posts');
        this.hasMany('threads');      
      });
      store.Model('Post', function(){
        this.belongsTo('user');
        this.belongsTo('thread');
      });
      store.Model('Thread', function(){
        this.belongsTo('user');
        this.hasMany('posts', {dependent:'nullify'});
      });
      
    });
    
  
    it('hasMany', function(next){ 
      store.ready(function(){
        var Thread = store.Model('Thread');
        var Post = store.Model('Post');
        
        Thread.find(1, function(thread){   
          thread.destroy(function(result){
            result.should.be.equal(true);
            
            Post.find([1, 2], function(posts){
              posts.length.should.be.equal(2);
              should.not.exist(posts[0].thread_id);
              should.not.exist(posts[1].thread_id);
              next();
            });
          });        
        });  
      });
    });
    
    
    
  });
};