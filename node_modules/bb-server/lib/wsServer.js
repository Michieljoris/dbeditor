/*global process:false require:false exports:false*/
/*jshint strict:false unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:7 maxcomplexity:7 maxlen:150 devel:true newcap:false*/ 


var  WebSocketServer = require('websocket').server;

function init(httpServer) {
    // http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
    "use strict";
 
    // Optional. You will see this name in eg. 'ps' or 'top' command
    process.title = 'node-chat';
 
    // Port where we'll run the websocket server
        var webSocketsServerPort = 1337;
 
    // websocket and http servers
    var webSocketServer = require('websocket').server;
    // var http = require('http');
 
    /**
     * Global variables
     */
    // latest 100 messages
    var history = [ ];
    // list of currently connected clients (users)
    var clients = [ ];
    var users = {};
 
    /**
     * Helper function for escaping input strings
     */
    function htmlEntities(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
 
    // Array with some colors
    var colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];
        // ... in random order
    colors.sort(function(a,b) { return Math.random() > 0.5; } );
   var currentColor = 0; 
 
    // /**
    //  * HTTP server
    //  */
    // var server = http.createServer(function(request, response) {
    //     // Not important for us. We're writing WebSocket server, not HTTP server
    // });
    // server.listen(webSocketsServerPort, function() {
    //     console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
    // });
 
    /**
     * WebSocket server
     */
    var wsServer = new webSocketServer({
        // WebSocket server is tied to a HTTP server. WebSocket request is just
        // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
        httpServer: httpServer
    });
    var adminConnection;
    // This callback function is called every time someone
    // tries to connect to the WebSocket server
    wsServer.on('request', function(request) {
        console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
        // accept connection - you should check 'request.origin' to make sure that
        // client is connecting from your website
        // (http://en.wikipedia.org/wiki/Same_origin_policy)
        var connection = request.accept(null, request.origin);
        // we need to know client index to remove them on 'close' event
        var index = clients.push(connection) - 1;
        var userName = false;
        var userColor = false;
        console.log((new Date()) + ' Connection accepted.');
 
        // send back chat history
        // if (history.length > 0 ) {
        //     connection.sendUTF(JSON.stringify( { type: 'history', data: history} ));
        // }
 
        // user sent some message
        connection.on('message', function(message) {
            if (message.type === 'utf8') { // accept only text
                if (userName === false) { // first message sent by user is their name
                    // remember user name
                    userName = htmlEntities(message.utf8Data);
                    if (userName === 'admin') adminConnection = connection;
                    else users[userName] = connection;
                    if (history.length > 0 && userName === 'admin') {
                        connection.sendUTF(JSON.stringify( { type: 'history', data: history} ));
                    }
                    // get random color and send it back to the user
                    // userColor = colors.shift();
                    userColor = colors[++currentColor%7];
                    console.log('Returning username', userName);
                    connection.sendUTF(JSON.stringify({ type:'color', data: userColor , userName: userName}));
                    console.log((new Date()) + ' User is known as: ' + userName
                                + ' with ' + userColor + ' color.');
 
                } else { // log and broadcast the message
                    console.log((new Date()) + ' Received Message from '
                                + userName + ': ' + message.utf8Data);
                    // we want to keep history of all sent messages
                    var obj = {
                        time: (new Date()).getTime(),
                        text: htmlEntities(message.utf8Data),
                        author: userName,
                        color: userColor
                    };
                        var to,colonLoc;
                    if (userName === 'admin') {
                        colonLoc = obj.text.indexOf(':');
                        if (colonLoc !== -1)
                            to = obj.text.slice(0,colonLoc);
                        console.log('TO', to);
                    }
                    history.push(obj);
                    history = history.slice(-100);
 
                    // broadcast message to all connected clients
                    var json = JSON.stringify({ type:'message', data: obj });
                    if (userName !== 'admin') connection.sendUTF(json);
                    if (userName !== 'admin' && adminConnection) adminConnection.sendUTF(json);
                    else if (users[to]) {
                        obj.text = obj.text.slice(colonLoc+1);
                        var json2 = JSON.stringify({ type:'message', data: obj });
                        users[to].sendUTF(json2);   
                        if (adminConnection) adminConnection.sendUTF(json);
                        
                    }
                    else if (!to && userName === 'admin') {
                        if (adminConnection) adminConnection.sendUTF(json);
                        for (var i=0; i < clients.length; i++) {
                            if (clients[i] !== adminConnection)
                                clients[i].sendUTF(json);
                        }
                    } 
                    else {
                        if (adminConnection) adminConnection.sendUTF(json);
                    } 
                }
            }
        });
 
        // user disconnected
        connection.on('close', function(connection) {
            if (userName !== false && userColor !== false) {
                if (userName === 'admin') adminConnection = undefined;
                else delete users[userName];
                console.log((new Date()) + " Peer "
                            + connection.remoteAddress + " disconnected.");
                // remove user from the list of connected clients
                clients.splice(index, 1);
                // push back user's color to be reused by another user
                colors.push(userColor);
            }
        });
 
    });
    
    
    
    // create the server
    
    // var wsServer = new WebSocketServer({
    //     httpServer: httpServer
    // });

    // // WebSocket server
    // wsServer.on('request', function(request) {
    //     var connection = request.accept(null, request.origin);
    //     // console.log('websocket', request);
    //     // This is the most important callback for us, we'll handle
    //     // all messages from users here.
    //     connection.on('message', function(message) {
    //         if (message.type === 'utf8') {
    //             // process WebSocket message
    //         }
    //     });

    //     connection.on('close', function(connection) {
    //         // close user connection
    //     });
    // });

}

exports.init = init;
