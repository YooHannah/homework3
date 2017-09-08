class defer {
	constructor(){
		this.donecbs = [];
		this.failcbs = [];
		this.catcbs = [];
		this.time = 0;
	}

	fire(cbs,arg){
		cbs.forEach((fn)=>{
			try{
				fn.call(this,arg)
			} catch(e){
				this.fire(this.catcbs,e)
			}
		})
		return this
	}
	done(cb){
		this.donecbs.push(cb)
		return this
	}
	fail(cb){
		this.failcbs.push(cb)
		return this
	}
	catch(cb){
		this.catcbs.push(cb)
		return this
	}
	resolve(arg){
		this.time++;
		this.fire(this.donecbs,arg)
		return this
	}
	reject(arg){
		this.fire(this.failcbs,arg)
		return this
	}
}

module.exports = defer