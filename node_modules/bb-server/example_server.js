/*global process:false require:false exports:false*/
/*jshint strict:false unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:7 maxcomplexity:7 maxlen:150 devel:true newcap:false*/ 

var server = require('./lib/bb-server.js'),
    // testMail = require("./testSendMail"),
    testGet = require("./testGet")
;

 
var options = { 
    "forward": [
	{ "prefix": "local",
	  "target": "http://localhost:5984" },
	{ "prefix": "iris",
          "target": "https://somedb.iriscouch.com"}
]
    ,"dir": false
    ,"index": false
    ,"silent": false
    ,"port": 7090
    ,postHandlers: {
        // "/sendmail" : testMail
        }
    
    ,getHandlers: {
        "/testget" : testGet,
        "/testGet" : testGet
        }
    ,sessions: {
        expires: 30
        // ,store: 'mysql'
        ,store: 'memory'
        // ,storeOpts: {
        //     //options for mysql, memory doesn't need any
        // }
    }
};

server.go(options);
