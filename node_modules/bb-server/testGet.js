exports.handleGet = function(req, res) {
    console.log('In handleGet!!!!');
    console.log(req.url.query);
    res.end("Ok then!!!!!");
    // setInterval(function() {
    //     console.log("Timer!!!!");
    //     }, 2000);
};




