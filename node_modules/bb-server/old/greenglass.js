/*global require:false exports:false*/
/*jshint strict:false unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:7 maxcomplexity:7 maxlen:150 devel:true newcap:false*/ 

exports.handlePost = function(req, res) {
    console.log("greenglass is handling post!!");
    req.on('data', function(chunk) {
        try {
            console.log("Greenglass received data!!");
            var data = JSON.parse(chunk);
            // console.log(data);
            var fs = require('fs');
            fs.writeFile("./terrariums.json", JSON.stringify(data), function(err) {
                if(err) {
                    console.log(err);
                } else {
                    console.log("The file was saved!");
                }
            }); 
            // res.write(JSON.stringify(data));
        } catch(e) {
            res.write('Failure');
        }
    });
    req.on('end', function() {
        // empty 200 OK response for now
        res.writeHead(200, "OK", {'Content-Type': 'text/html'});
        res.end();
    });
    
}; 