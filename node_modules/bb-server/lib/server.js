/*global process:false require:false exports:false*/
/*jshint strict:false unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:7 maxcomplexity:7 maxlen:150 devel:true newcap:false*/ 

var sys = require('sys'),
    http = require('http'),
    fs = require('fs'),
    url = require('url'),
    https = require('https'),
    md = require("node-markdown").Markdown
    // firstdoor = require("./firstDoorSendMail"),
    // greenglass = require("./greenglass")


// ,events = require('events')
;

var options;
var log = console.log;

function escapeHtml(value) {
    return value.toString().
        replace('<', '&lt;').
        replace('>', '&gt;').
        replace('"', '&quot;');
}

function createServlet(Class) {
    var servlet = new Class();
    return servlet.handleRequest.bind(servlet);
}

/**
 * An Http server implementation that uses a map of methods to decide
 * action routing.
 *
 * @param {Object} Map of method => Handler function
 */
function HttpServer(handlers) {
    
    this.handlers = handlers;
    if (!options.secure) this.server = http.createServer(this.handleRequest_.bind(this));
    else {
        var ssl = {
            key: fs.readFileSync('privatekey.pem'),
            cert: fs.readFileSync('certificate.pem') };
        this.server = https.createServer(ssl, this.handleRequest_.bind(this));
    }
}


HttpServer.prototype.parseUrl_ = function(urlString) {
    var parsed = url.parse(urlString);
    parsed.pathname = url.resolve('/', parsed.pathname);
    return url.parse(url.format(parsed), true);
};

function error(response, err, reason, code) {
    log('Error '+code+': '+err+' ('+reason+').');
    response.writeHead(code, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify({ err: err, reason: reason }));
    response.end();
}


function unknownError(response, e) {
    log(e.stack);
    error(response, 'unknown', 'Unexpected error.', 500);
}

function forwardRequest(inRequest, inResponse, uri) {
    log(inRequest.method + ' ' + uri);

    uri = url.parse(uri);
    var out = http.createClient(uri.port||80, uri.hostname);
    var path = uri.pathname + (uri.search || '');
    var headers = inRequest.headers;
    headers.host = uri.hostname + ':' + (uri.port||80);
    headers['x-forwarded-for'] = inRequest.connection.remoteAddress;
    headers.referer = 'http://' + uri.hostname + ':' + (uri.port||80) + '/';

    var outRequest = out.request(inRequest.method, path, headers);

    out.on('error', function(e) { unknownError(inResponse, e); });
    outRequest.on('error', function(e) { unknownError(inResponse, e); });

    inRequest.on('data', function(chunk) { outRequest.write(chunk); });
    inRequest.on('end', function() {
        outRequest.on('response', function(outResponse) {
            // nginx does not support chunked transfers for proxied requests
            delete outResponse.headers['transfer-encoding'];

            if (outResponse.statusCode === 503) {
                return error(inResponse, 'db_unavailable', 'Database server not available.', 502);
            }

            inResponse.writeHead(outResponse.statusCode, outResponse.headers);
            outResponse.on('data', function(chunk) { inResponse.write(chunk); });
            outResponse.on('end', function() { inResponse.end(); });
        });
        outRequest.end();
    });
}

function getForwardingUrl(u) {
    for (var i = 0; i < options.forward.length; i++) { 
        // console.log(options.forward[i]);
        var prefix = options.forward[i].prefix;
        // console.log(u.pathname.substring(1,prefix.length+1));
        if (u.pathname.substring(1, prefix.length + 1) === prefix)
            return options.forward[i].target + u.pathname.substring(prefix.length+1) +
            (u.search||'');
    }
    return false;
}

HttpServer.prototype.handleRequest_ = function(req, res) {
    var logEntry = req.method + ' ' + req.url;
    // if (req.headers['user-agent']) {
    //     logEntry += ' **' + req.headers['user-agent'];
    // }
    log(logEntry);
    req.url = this.parseUrl_(req.url);
    var u = url.parse(req.url);
    if (options.forward) {
        u = getForwardingUrl(u);
        if (u) {
            forwardRequest(req, res, u);
            return;
        }
    }
    var handler = this.handlers[req.method];
    if (!handler) {
    log(req.method);
        res.writeHead(501);
        res.end();
    } else {
        handler.call(this, req, res);
    }
};

/**
 * Handles static content.
 */
function StaticServlet() {}

StaticServlet.MimeMap = {
    'txt': 'text/plain',
    'html': 'text/html',
    'htm': 'text/html',
    'css': 'text/css',
    'xml': 'application/xml',
    'json': 'application/json',
    'js': 'application/javascript',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'png': 'image/png',
    'appcache': 'text/cache-manifest',
    'woff': 'application/x-font-woff',
    'markdown': 'text/x-markdown; charset=UTF-8',
    'md': 'text/x-markdown; charset=UTF-8',
    'mp3': 'audio/mpeg;',
    'ogg': 'audio/ogg;'
};

StaticServlet.prototype.handleRequest = function(req, res) {
    var self = this;
    // var path = ('./' + req.url.pathname).replace('//','/').replace(/%(..)/, function(match, hex){
    //     return String.fromCharCode(parseInt(hex, 16));
    // });
    var path = (options.root + req.url.pathname).replace('//','/').replace(/%(..)/, function(match, hex){
        return String.fromCharCode(parseInt(hex, 16));
    });
    
    var parts = path.split('/');
    if (parts[parts.length-1].charAt(0) === '.')
        return self.sendForbidden_(req, res, path);
    fs.stat(path, function(err, stat) {
        if (err)
            return self.sendMissing_(req, res, path);
        if (stat.isDirectory())
            return self.sendDirectory_(req, res, path);
        return self.sendFile_(req, res, path);
    });
};

function sendError(req, res, error) {
    res.writeHead(500, {
        'Content-Type': 'text/html'
    });
    res.write('<!doctype html>\n');
    res.write('<title>Internal Server Error</title>\n');
    res.write('<h1>Internal Server Error</h1>');
    res.write('<pre>' + escapeHtml(sys.inspect(error)) + '</pre>');
    res.end();
    log('500 Internal Server Error');
    log(sys.inspect(error));
}

StaticServlet.prototype.sendError_ = sendError;



function sendMissing(req, res, path) {
    path = path.substring(1);
    res.writeHead(404, {
        'Content-Type': 'text/html'
    });
    res.write('<!doctype html>\n');
    res.write('<title>404 Not Found</title>\n');
    res.write('<h1>Not Found</h1>');
    res.write(
        '<p>The requested URL ' +
            escapeHtml(path) +
            ' was not found on this server.</p>'
    );
    res.end();
    log('404 Not Found: ' + path);
}

StaticServlet.prototype.sendMissing_ = sendMissing;

StaticServlet.prototype.sendForbidden_ = function(req, res, path) {
    path = path.substring(1);
    res.writeHead(403, {
        'Content-Type': 'text/html'
    });
    res.write('<!doctype html>\n');
    res.write('<title>403 Forbidden</title>\n');
    res.write('<h1>Forbidden</h1>');
    res.write(
        '<p>You do not have permission to access ' +
            escapeHtml(path) + ' on this server.</p>'
    );
    res.end();
    log('403 Forbidden: ' + path);
};

StaticServlet.prototype.sendRedirect_ = function(req, res, redirectUrl) {
    res.writeHead(301, {
        'Content-Type': 'text/html',
        'Location': redirectUrl
    });
    res.write('<!doctype html>\n');
    res.write('<title>301 Moved Permanently</title>\n');
    res.write('<h1>Moved Permanently</h1>');
    res.write(
        '<p>The document has moved <a href="' +
            redirectUrl +
            '">here</a>.</p>'
        );
    res.end();
    log('301 Moved Permanently: ' + redirectUrl);
};

function writeHead(req, res, mimeType, GMTdate) {
    res.writeHead(200, {
        'Content-Type': 
	mimeType || 'text/plain',
	'last-modified': GMTdate
    });
    
    if (req.method === 'HEAD') {
        res.end();
        return true;
    }
    return false;
    
}

StaticServlet.prototype.sendFile_ = function(req, res, path) {
    var self = this;
    var GMTdate = fs.statSync(path).mtime;
    var mimeType = StaticServlet.MimeMap[path.split('.').pop()] || 'text/plain';
    if (typeof mimeType === 'undefined') mimeType = 'text/plain';
    log(GMTdate, mimeType);
    
    if (mimeType && options.markdown && mimeType.indexOf('text/x-markdown') === 0) {
        mimeType = StaticServlet.MimeMap.html;
        if (writeHead(req, res, mimeType, GMTdate)) return;
        fs.readFile(path,'utf8', function (err, data) {
            if (err) {
                self.sendError_(req, res, err);
            }
            else {
                var html = md(data); 
                res.end(html);   
            }
        });
        
    
        return;
    }
        
    if (writeHead(req, res, mimeType, GMTdate)) return;
    
    var file = fs.createReadStream(path);
    file.on('data', res.write.bind(res));
    file.on('close', function() {
        res.end();
    });
    file.on('error', function(error) {
        self.sendError_(req, res, error);
    });
};

StaticServlet.prototype.sendDirectory_ = function(req, res, path) {
    function send(f) {
        if (!options.dir) {
            return  self.sendForbidden_(req,res, path);
        }
        else return f();
    }
    
    var self = this;
    if (path.match(/[^\/]$/)) {
        req.url.pathname += '/';
        var redirectUrl = url.format(url.parse(url.format(req.url)));
        return send(function(){ return self.sendRedirect_(req, res, redirectUrl);});
    }
    fs.readdir(path, function(err, files) {
        if (err)
            return send(function() {return self.sendError_(req, res, err);});

        if (!files.length)
            return send(function() {return self.writeDirectoryIndex_(req, res, path, []);});

        var remaining = files.length;
        files.forEach(function(fileName, index) {
            fs.stat(path + '/' + fileName, function(err, stat) {
                if (err) {
                    // return self.sendError_(req, res, err);
                    files[index] = '-->' + fileName + '';
                }
                else if (stat.isDirectory()) {
                    files[index] = fileName + '/';
                }
                if (options.index && (fileName === 'index.html' ||
                                      fileName === 'index.htm')) {
                    log('Sending index.html and not the directory!!! ') ;
                    return self.sendFile_(req, res, path + '/' + fileName);   
                }
                if (!(--remaining))
                    return send(function() {return self.writeDirectoryIndex_(req, res, path, files);});
            });
        });
    });
};

StaticServlet.prototype.writeDirectoryIndex_ = function(req, res, path, files) {
    path = path.substring(1);
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    if (req.method === 'HEAD') {
        res.end();
        return;
    }
    res.write('<!doctype html>\n');
    res.write('<title>' + escapeHtml(path) + '</title>\n');
    res.write('<style>\n');
    res.write('  ol { list-style-type: none; font-size: 1.2em; }\n');
    res.write('</style>\n');
    res.write('<h1>Directory: ' + escapeHtml(path) + '</h1>');
    res.write('<ol>');
    files.forEach(function(fileName) {
        if (fileName.charAt(0) !== '.') {
            res.write('<li><a href="' +
                      escapeHtml(fileName) + '">' +
                      escapeHtml(fileName) + '</a></li>');
        }
    });
    res.write('</ol>');
    res.end();
};

process.on('uncaughtException', function(e) {
    log(e.stack);
});


exports.createServer = function (someOptions) {
    
    options = someOptions || {};

    if (!options.root) {
        try {
            fs.lstatSync('./public');
            options.root = './public';
        }
        catch (err) {
            options.root = './';
        }
    }
    
    // if (!options.postHandlers) options.postHandlers = {};
    
    function handlePost(req, res) {
        if (!options.postHandlers) return;
        console.log("[200] " + req.method + " to " , req.url);
        var path = req.url.path;
        var postHandler = options.postHandlers[path];
        if (postHandler) postHandler.handlePost(req, res);
        // Object.keys(options.handlePost
        // switch (path) {
        //   case "/contactus_form":       
        //     firstdoor.handlePost(req, res);
        //     break;
        //   case "/greenglass" :
        //     greenglass.handlePost(req, res);
        //     break;
        // default: 
        else sendMissing(req, res, path);
    // } 
            
    }
    
    
    var standardGetHandler = createServlet(StaticServlet);
    function getHandler(req, res) {
        var pathname = req.url.pathname;
        // console.log(req, pathname);
        var handler;
        if (options.getHandlers &&
            (handler = options.getHandlers[pathname])) {
            
            handler.handleGet(req, res);
        }
        else standardGetHandler(req,res);
        
    }
    // console.log(someOptions);
    var server = new HttpServer({
        // 'GET': standardGetHandler,
        'GET': getHandler,
        'HEAD': createServlet(StaticServlet),
        'POST': handlePost
    });
    var result = server.server;
    
    // options.prefix = options.prefix || 'db';
    // options.prefix = '/' + options.prefix + '/';
    
    // options.target = options.target || 'http://localhost:5984';
    result.root = options.root;
    log =  options.silent ?  function () {}: function() {
        console.log.apply(console, arguments);
    };
    // if (options.headers) {
    //     result.headers = options.headers; 
    // }

    // result.cache = options.cache || 3600; // in seconds.
    // result.autoIndex = options.autoIndex !== false;
    
    // if (options.ext) {
    //     result.ext = options.ext === true ? 'html' : options.ext;
    // }
    return result;
};
