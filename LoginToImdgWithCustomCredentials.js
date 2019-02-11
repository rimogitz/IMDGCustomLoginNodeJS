const HazelcastClient = require('hazelcast-client').Client;
const Config = require('hazelcast-client').Config;
let listener = require('./listener');
var fs = require('fs');
var config = new Config.ClientConfig();

function IMDGLoginCredentials(endPoint,principal,password){
	this.endPoint=endPoint;
	this.principal=principal;
	this.password=password;
}

IMDGLoginCredentials.prototype.readPortable=function(pReader){
	endPoint=pReader.readUTF('endPoint');
	principal=pReader.readUTF('principal');
	password=pReader.readUTF('password');
}

IMDGLoginCredentials.prototype.writePortable=function(pWriter){
	pWriter.writeUTF('endPoint',this.endPoint);
	pWriter.writeUTF('principal',this.principal);
	pWriter.writeUTF('password',this.password);
}

IMDGLoginCredentials.prototype.getPrincipal=function(){
	return this.principal;
}

IMDGLoginCredentials.prototype.getEndPoint=function(){
	return this.endPoint;
}

IMDGLoginCredentials.prototype.getPassword=function(){
	return this.password;
}

IMDGLoginCredentials.prototype.setPrincipal=function(principal){
	this.principal=principal;
}
IMDGLoginCredentials.prototype.setEndPoint=function(endPoint){
	this.endPoint=endPoint;
}
IMDGLoginCredentials.prototype.setPassword=function(password){
	this.password=password;	
}
IMDGLoginCredentials.prototype.getFactoryId=function(){
	return 1;
}
IMDGLoginCredentials.prototype.getClassId=function(){
	return 1;
}

function ImdgPortableFactory(){}
ImdgPortableFactory.prototype.create=function(classId){
	if (classId === 1){
		return new IMDGLoginCredentials();
	}
	return null;
}

config.serializationConfig.portableVersion='0';
config.serializationConfig.portableFactories[1] = new ImdgPortableFactory();

process.stdout.write("Dir Name : "+ __dirname);
let initConfig = (nearCache) => {
	  
	  config.networkConfig.addresses = [{host: '127.0.0.1', port: '5701'}];
	  config.customCredentials=new IMDGLoginCredentials('127.0.0.1','david','password1');
	  if (nearCache) {
	    let orgsNearCacheConfig = new Config.NearCacheConfig();
	    orgsNearCacheConfig.invalidateOnChange = true;
	    orgsNearCacheConfig.name = 'importantMap';

	    let ncConfigs = {};
	    ncConfigs[orgsNearCacheConfig.name] = orgsNearCacheConfig;
	    config.nearCacheConfigs = ncConfigs;
	    process.stdout.write("Config Start ==> \n");
		  process.stdout.write((JSON.stringify(config, null, 2)));
		  process.stdout.write("Config End  ==> \n");
	  }
	  return config;
    };



HazelcastClient.newHazelcastClient(initConfig(false)).then((client) => {
  
    console.log('Client connected');
    let map = client.getMap('importantMap');
    map.put("100","EntryFromNodeJS")
    .then(() => map.get("100")
    .then((val) => console.log('Value Retreived from Map =>'+val)));
    
   });
