const mongoose = require('mongoose');
const exec = mongoose.Query.prototype.exec;
const redis= require('redis');
const util = require ('util');

const redisUrl="redis://127.0.0.1:6379";
const client = redis.createClient(redisUrl);
client.hget= util.promisify(client.hget);


mongoose.Query.prototype.cache = function (options = {}) {
    console.log("I am here cache",options);
    this.useCache = true;
    this.hashKey = JSON.stringify(options['key'] || '');
    console.log("the hasgh key",this.hashKey);
    return this; // for chaining on query calls
} 

mongoose.Query.prototype.exec = async function(){
    if(!this.useCache){
        return exec.apply(this,arguments);
    }
    const key = JSON.stringify(Object.assign({},this.getQuery(),{
        collection:this.mongooseCollection.name}));
        
    const cacheValue = await client.hget(this.hashKey,key);
    if(cacheValue){
    console.log("-----",cacheValue);
    try{
        const doc = JSON.parse(cacheValue);
        return Array.isArray(doc) 
    ? doc.map(d=> new this.model(d))
    : new this.model(cacheValue);
    }catch(e){
     console.log(e);
    }
    }    
    const result = await exec.apply(this,arguments);
    console.log("----r",result);
    client.hset(this.hashKey,key,JSON.stringify(result));

    return result;
}

module.exports ={
    clearHash(hashKey){
       client.del(JSON.stringify(hashKey));
    }
}