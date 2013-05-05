bb-server
===========

Basic node server with forwarding to couchdb to get around the
Access-Control-Allow-Origin, cobbled together from a few basic html
servers written by other people. The couchdb forwarding comes from a
cloudant faq, the commandline interface from
[http-server](https://github.com/nodeapps/http-server), the basic
server I've forgotten where it came from. 

I've adapted it here and there to suit my purposes which is to have a quick
and dirty node html server. You can have this server forward requests
to a couchdb server, which is handy because now you can interface with
a couchdb that's from a different origin than your website/app.

You can plugin your own GET and POST handlers triggered by route.

This server is a raw server, it only requires the http and url network modules
to function. The commandline interface requires a few more utility
modules.

To install clone it, cd into the directory and do:
 
	npm install

Then ./bin/bb-server to run it.

Or do:

	npm install -g bb
	
Then bb-server to run.

You can also install it directly from npm:

	nmp install bb-server
	
Though that might not be the most recent version.	
	  
Commandline usage: 

bb-server [path] [options],

	    options:
          -p --port          Port to use [HTTPSERVER_PORT || 8080]",
          -a --address       Address to use [HTTPSERVER_IPADDR || 0.0.0.0]",
          -b --block         Block directory contents",
          -i --index         Show index.htm[l] when present in directory",
          -f --forward       Forward url/prefix to target",
          --prefix           [db]",
          --target           [http://localhost:5984]",
          --file             load options from .json file",
          --secure           start https server",
          -m                 Don't convert .md or .markdown files to html",
          -w                 Turn on websocket server"
          -s --silent        Suppress log messages from output",
          -h --help          Print this list and exit."
		  
		  
		  
See the example_server.js file for an example of requiring the server
in your own module. You can then also plugin your own post and get handlers.

