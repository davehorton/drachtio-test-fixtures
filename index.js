var spawn = require('child_process').spawn ;
var exec = require('child_process').exec ;
var debug = require('debug')('drachtio:fixtures') ;
var path = require('path') ;

var localServer ;
var remoteServer ;

exports = module.exports = {
	localConfig: require('./fixtures/localConfig'),
	remoteConfig: require('./fixtures/remoteConfig'),
	beforeTest: function(done, cwd) {
	    exec('pkill drachtio', function () {
	    	var myLocalPath = path.join(__dirname, 'fixtures', 'drachtio.conf.local.xml') ;
	    	var myRemotePath = path.join(__dirname, 'fixtures', 'drachtio.conf.remote.xml') ;
	    	debug('starting servers, cwd will be: %s, local config: %s, remote config: %s', cwd, myLocalPath, myRemotePath) ;
	        localServer = spawn('drachtio',['-f', myLocalPath],{cwd: cwd }) ;
	        remoteServer = spawn('drachtio',['-f', myRemotePath],{cwd: cwd }) ;
	        done() ;
	     }) ;
	}, 
	afterTest: function(done) {
	    this.timeout(1000) ;
	    setTimeout( function() {
	        localServer.kill() ;
	        remoteServer.kill() ;
	        done() ;
	    }, 450) ;
	}
} ;

