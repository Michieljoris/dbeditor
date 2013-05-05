var sys = require('sys');

var colors = require('colors'),
    httpServer = require('./server.js'),
    portfinder = require('portfinder'),
    wsServer = require('./wsServer.js'),
    forever = require('forever-monitor');
var version = 0.2;

function getOptionString(o) {
    return (o ? 'yes'.green : 'no'.red) ;
}


function listen(log, host, port, argv) {
    argv = {
        root: (argv._ && argv._[0]) || argv.root || './',
        dir: !(argv.b || argv.block),
        index: argv.i || argv.index,
        gzip: argv.g || argv.gzip,
        forward: argv.forward,
        secure: argv.secure,
        // headers
        cache: argv.c || argv.cache,
        ext: argv.e || argv.ext,
	silent: argv.s || argv.silent,
        markdown: !argv.m,
        wsServer: argv.w,
        postHandlers: argv.postHandlers,
        getHandlers: argv.getHandlers
    };
    
    var server = httpServer.createServer(argv);
    
    if (argv.wsServer) {
       wsServer.init(server); 
    }
    
    server.listen(port, host, function() {
        log('Version ' + version);
        log('Starting up http-server, serving '.yellow
            + server.root.cyan
            + ' on: '.yellow +
            (host + ':' + port).cyan);
        log('Listing dir contents : '.grey + getOptionString(argv.dir));
        log('Auto show index.htm[l]: '.grey + getOptionString(argv.index));
        log('Convert Markdown: '.grey + getOptionString(argv.markdown));
        log('Https server: '.grey + getOptionString(argv.secure));
        log('Forward '.grey + getOptionString(argv.forward));//
        if (argv.forward) console.log(argv.forward);
        log('Websocket server '.grey + getOptionString(argv.wsServer));//
        if (argv.getHandlers) {
           log('getHandlers:'.grey, Object.keys(argv.getHandlers));
        }
        if (argv.postHandlers) {
           log('postHandlers:'.grey, Object.keys(argv.postHandlers));
        }
        // log('Hit CTRL-C to stop the server');
    });
}


exports.go = function(argv) {
    
    if (process.platform !== 'win32') {
        //
        // Signal handlers don't work on Windows.
        //
        process.on('SIGINT', function () {
            log('http-server stopped.'.red);
            process.exit();
        });
    }
    
    if (argv.f || argv.forward) {
        argv.forward = [ {
            prefix: argv.prefix || 'db',
            target: argv.target || 'http://localhost:5984'
        } ];
    } 

    var port = argv.p || argv.port || Number(process.env.HTTPSERVER_PORT),
    host = argv.a || argv.address || process.env.HTTPSERVER_IPADDR || '0.0.0.0',
    log = (argv.s || argv.silent) ? (function () {}) : console.log;

    if (!port) {
        portfinder.basePort = 8080;
        portfinder.getPort(function (err, port) {
            if (err) throw err;
            listen(log, host, port, argv);
        });
    } else {
        listen(log, host, port, argv);
    }
    
};
