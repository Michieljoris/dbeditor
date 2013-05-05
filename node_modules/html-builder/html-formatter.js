/*global exports:false process:false require:false*/
/*jshint strict:false unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:6 maxcomplexity:10 maxlen:190 devel:true*/
// var sys = require('sys');
var htmlparser = require("htmlparser2");

function formatter(html, options) {
    "use strict";
    options = options || {};
    var indentSize = options.indentSize || 4;
    var maxLineLength = options.maxLineLength || 10; 
    var defaultIndent = options.indent || 0;
    // require('console').log(options);
    
    var results = "";
 
    var indent = '                                                                                                                               ';
    var n = defaultIndent;
    indentSize = indentSize || 4;
    maxLineLength =  maxLineLength || 0;
    var lastTag;
    
    // HTMLParser("<p id=test>hello <i>world", {
    var parser = new htmlparser.Parser({
        // HTMLParser(html, {
        onopentag: function( tag, attrs ) {
            var unary=false;
            results += '\n' + indent.slice(0,n)  + "<" + tag;

            Object.keys(attrs).forEach(function(k) {
                results += " " + k + '="' + attrs[k] + '"';
            });
 
            results += (unary ? "/" : "") + ">";
            lastTag = tag + n;
            n+= indentSize;
        },
        onclosetag: function( tag ) {
            n-= indentSize;
            if (tag === 'meta') return;
            var ind;
            if (lastTag === tag + n) ind = '';
            else ind = '\n' + indent.slice(0,n);
            results += ind  + "</" + tag + ">";
        
        },
        ontext: function( text ) {
            var ind = ''; 
            if (text && text.length > 0) {
                text = text.split('\n').join('');
                if (text.length > maxLineLength) {
                    lastTag = '';
                    ind = '\n' + indent.slice(0,n);
                }  
                results +=  ind + text ;
            }
        },
        comment: function( text ) {
            lastTag = '';
            if (text && text.length > 0)
                results += indent.slice(0,n) + "<!--" + text + "-->";
        }
    });
    
    // parser.write("Xyz <script language= javascript>var foo = '<<bar>>';< /  script>");
    parser.write(html);
    parser.done();
    return results.slice(1);
}

exports.format = formatter;



// try {
//     var partial = require('fs').readFileSync(
//         '/home/michieljoris/www/firstdoor/partials/footer-bottom.html',
//         'utf8');
//     console.log(partial);
//     console.log(formatter(partial));
// } catch(e) {
//     console.log("Couldn't find file ",e );
//     }
