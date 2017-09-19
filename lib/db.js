const Tapable = require('tapable')

class DB extends Tapable {
  constructor(options) {
    // TODO
    super(options);
    this.options = options;
  }

  request(obj) {
    // TODO
    	if(obj == undefined){ // test 1
	    	for(let item in this._plugins){
	      	  let fn=this._plugins[item][0];
	      	  return fn()
	      	}
      }else if(obj.type === 1){ // test 2

      	if(this._plugins.judge == undefined){
      		for(let item in this._plugins){
    		 	let fn1=this._plugins[item][0];
      	  return fn1(obj)
      	 }
      	}else{
      		console.log(111)
      		let temp=this._plugins.endpoint[0](obj);
      		let judgefn =  this._plugins.judge[0];
	      	temp.then((res) => {
	      			// let result = judgefn(res);
      		  //  console.log(result);
	          return new Promise(function(resolve, reject) {
	          	 setTimeout(judgefn(res),100)
						})
      	})
	     }

      }else if(obj.type === 0){ // test 2
      	for(let item in this._plugins){
    		 	let fn2=this._plugins[item][1];
      	  return fn2(obj)
      	}
      }else if(obj.url){ // test 3 test 4
      		for(let name in this.options){
      			if(obj[name] == undefined){
      				obj[name] = this.options[name];
      			}
      		}
      	 for(let item in this._plugins){
      	 	let fn2;
      	 	if(this._plugins[item].length>1){
      	 		for(let i=0;i<this._plugins[item].length;i++){
      	 			fn2 = this._plugins[item][i];
      	 			obj = fn2(obj)
      	 		}
      	 	}else{
      	 		fn2 =this._plugins[item][0];
      	    obj = fn2(obj)
      	 	}

      	}
      	return obj;
      }
    }
}

module.exports = DB