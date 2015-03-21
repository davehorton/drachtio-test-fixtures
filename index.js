var spawn = require('child_process').spawn ;
var exec = require('child_process').exec ;
var fs = require('fs') ;
var async = require('async') ;
var debug = require('debug')('drachtio:fixtures') ;

exports = module.exports = function( cwd, adminPorts, sipPorts ) {
	if( !( adminPorts instanceof Array ) ) throw new Error('parameter expected to be an array: ', adminPorts);
	if( !( sipPorts instanceof Array ) ) throw new Error('parameter expected to be an array: ', sipPorts);
	if( adminPorts.length !== sipPorts.length ) throw new Error('must have equal number of adminPorts and sipPorts') ;

	return function() {
		var servers = [] ;
		var params = [] ;
    var clients = [] ;
    var sipServers = [] ;

		for( var i = 0; i < adminPorts.length; i++ ) {
			params.push({
				cmdLineArgs: ['-f',__dirname + '/fixtures/drachtio.conf' + i + '.xml','-p', adminPorts[i],'-c','sip:127.0.0.1:' + sipPorts[i]],
				cwd: cwd
			}) ;
      var client = require(__dirname + '/fixtures/config' + i + '.js') ;
      client.connect_opts.port = adminPorts[i] ;
      clients.push( client ) ;
      sipServers.push( 'sip:127.0.0.1:' + sipPorts[i] ) ;
		}

		return {
			startServers: function(done) {
        exec('pkill drachtio', function () {
          for( var i = 0; i < params.length; i++ ) {
            var server = spawn('drachtio', params[i].cmdLineArgs, {cwd: params[i].cwd}) ;
            servers.push( server ) ;
          }
        	done() ;
        }) ;
			},
			stopServers: function(done) {
				servers.forEach(function(server){
					server.kill() ;
				}) ;
				done() ;
			},
      configureUac: function( config, Agent ) {
        var uac = new Agent(function(req,res){}) ;
        uac.set('api logger',fs.createWriteStream(config.apiLog) ) ;
        uac.connect(config.connect_opts) ;
        return uac ;
      },
      connectAll: function( agents, cb ) {
        async.each( agents, function( agent, callback ) {
          if( agent.connected ) agent.disconnect() ;
            agent.on('connect', function(err) {
              return callback(err) ;
            }) ;
        }, function(err) {
            if( err ) return cb(err) ;
            cb() ;
        }) ;
    },
      client: clients,
      sipServer: sipServers
		} ;
	}() ;
} ;
