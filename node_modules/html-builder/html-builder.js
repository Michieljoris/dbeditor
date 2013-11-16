
/*global exports:false require:false process:false*/
/*jshint strict:false unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:6 maxcomplexity:10 maxlen:190 devel:true*/
// var sys = require('sys');

var Plates = require('plates');
var util = require('util');
var fs = require('fs');
// var path = require('path');
var htmlFormatter = require('./html-formatter.js');
var md = require("node-markdown").Markdown;
// var filemon = require('filemonitor');
// var sys = require('sys');
// var exec = require('child_process').exec;
// var colors = require('colors');


var log;

var defaultPartials = {
   _linkBlock: '', _scriptBlock: '' 
    ,script: '<script type="text/javascript" src="bla"></script>'
    ,link:'<link rel="stylesheet" type="text/css" href="">'
};
var partialsCollection = {};
// var monitoredDirs;


function saveFile(name, str){
    fs.writeFileSync(
        // path.join(process.cwd(), name),
        name,
        str,
        'utf8');
}

function endsWith(str, trail) {
    return (str.substr(str.length-trail.length, str.length-1) === trail);
}


function trailWith(str, trail) {
    return str ? (str + (!endsWith(str, trail) ? trail : '')) : undefined;
}

function getPartial(partialsPath, name) {
    var partial, path, partialName; 
    // log('getting partial', name);
    if (name.indexOf('.') === -1) {
        partial = partialsCollection[name];   
        if (partial) return partial;
    }
    partialName = name;
    // log('searching for partial on disk');
    var isMarkdown = endsWith(name, '.md') || endsWith(name, '.markdown');
    var isJs = endsWith(name, '.js');
    if (!isJs && !isMarkdown) name = trailWith(name, '.html');
    try {
        path = partialsPath + name;
        partial = fs.readFileSync(path, 'utf8');
        if (isMarkdown) partial = md(partial);
    } catch(e) {
        // console.log("Couldn't find partial " + partialsPath + name);
    }
    if (!partial) {
        log(partialName.red + " has not been defined nor found in " +
            partialsPath.red + ' as an html file.');
        partial = makeTag('div', {
            'class': 'row',
            style: 'margin-left: 0; padding-left:10px; border:solid grey 1px; height:40; width:100%;' 
            ,innerHtml: 'placeholder for ' + partialName
        });
    }
    return partial;   
}

function makeStyleBlock(args) {
    // console.log('Making style block\n', args);
    var path = trailWith(args.path, '/') || 'css/';
    var array = args.files;
    
    var map = Plates.Map();
    map.where('rel').is('stylesheet').use('data').as('href');
    var style = getPartial(args.partialsDir, 'link'); 
    var result = '';
    array.forEach(function(e) {
        if (e instanceof Object) {
            e.rel = 'stylesheet';
            e.type = 'text/css';
            if (e.indexOf('http') === 0)
                e.href = trailWith(e.name, '.css');
            else e.href = trailWith(path + e.name, '.css');
            delete e.name;
            result += makeTag('link', e);
        }
        else {
            e = trailWith(e, '.css');
            var data;
            if (e.indexOf('http') === 0)
                data = { data: e };
            else data = { data: path + e };
            result += Plates.bind(style, data, map);
        }
    });
    
    return result + '\n';   
}

function makeScriptBlock(args) {
    // console.log('Making script block\n', args);
    var path = trailWith(args.path, '/') || 'js/';

    var array = args.files;
    var map = Plates.Map();
    map.where('type').is('text/javascript').use('data').as('src');
    var script = getPartial(args.partialsDir, 'script'); 
    var result = '';
        array.forEach(function(e) {
            e = trailWith(e, '.js');
            var data = { data: path + e };
            result += Plates.bind(script, data, map);
        });
    return result + '\n';   
}


function makeTag(tag, attrs, unary) {
    var result = '<' + tag;
    attrs = attrs || {};
    var innerHtml = '';
    Object.keys(attrs).forEach(function(a) {
        if (a === 'innerHtml') innerHtml = attrs[a];
        else result += ' ' + a + '=' + '\'' + attrs[a] + '\'';
    });
    result += '>' + innerHtml;
    if (!unary) result += '</' + tag + '>';
    
    return result;   
}

function makeRouterMapping(route, partial, cntl) {
    if (partial[0] !== '/') partial = '/' + partial;
    return ',["' + route + '", "' + partial + '"' +
        (cntl ? ', ' + cntl : '')  +
        ']\n'; 
}

function makeRouterBlock(routes) {
    var routerMapping = '';
    // log('isarray', util.isArray(routes));
    if (routes && util.isArray(routes)) {
        routes.forEach(function(r) {
            routerMapping += makeRouterMapping(r[0], r[1], r[2]) ;
        }); 
        if (routerMapping.length && routerMapping[0] === ',')
            routerMapping = routerMapping.slice(1);
        // log(routerMapping);
    }
    return routerMapping;
}


function buildMenuTree(tree) {
    tree = tree || [];
    
    // var str = '<div class="ie-dropdown-fix" > <div id="navigation">' +
    //     '<ul id="nav" class="menu sf-menu">';
    var str = '';
    function removeSlashes(str) {
        if (str[0] === '/') str = str.slice(1);
        if (str[str.length-1] === '/') str = str.slice(0, str.length-1);
        return str;
    }
    
    function makeLi(entry) {
        
        var href = entry.href ||
            (entry.route ? 'index.html#!/' + removeSlashes(entry.route) : undefined) ||
            '#';
        
        var li = '<li><a href="' + href + '"' + 
            (entry.scroll ? (' class="scroll"') : '') +
            (entry.id ? (' id="' + entry.id + '"') : (' id="' + removeSlashes(entry.route + '"'))) + 
            '>' +
            (entry.icon ? ('<i class="icon-' + entry.icon + '"></i>') : '') +
            entry.label + '</a>';
        if (entry.sub) {
            li += '<ul>';
            entry.sub.forEach(function(e){
                li += makeLi(e); 
            });
            li += '</ul>';
        }
        
        li +='</li>';
        return li;
    }
    
    tree.forEach(function(e){
        str += makeLi(e); 
    });
    // var length = routerMapping.lenght;
    // if (length && routerMapping[length-1] === ',')
    //     routerMapping = routerMapping.slice(0, length-1);
    // var end = '</ul></div></div><div class="clear"></div>';
    // str += end;   
    return str;
}

function addTo_Blocks(js, css) {
    partialsCollection._scriptBlock += makePartial('scriptBlock', { files: js});
    partialsCollection._linkBlock += makePartial('linkBlock', { files: css});
} 

function makeMenu(args) {
    var menus = {
        
        superfish: { 
            start: '<div class="ie-dropdown-fix" > <div id="navigation">' +
                '<ul id="nav" class="menu sf-menu">',
            end: '</ul></div></div><div class="clear"></div>',
            js : [
                'hoverIntent'
                ,'superfish'
                ,'startSuperfish'
            ],
            css : ['superfish'] }
        ,css: {
            start: '<div class="ie-dropdown-fix" > <div id="navigation">' +
                '<ul id="nav" class="menu">',
            end: '</ul></div></div><div class="clear"></div>',
            js: [],
            css: ['menu']
        }
    };
    var menu = menus[args.type];
    if (!menu) return '';
    addTo_Blocks(menu.js, menu.css);
    return menu.start + buildMenuTree(args.tree) + menu.end;
    
}

function makeSequenceSlider(slides) {
    var js = [
            'sequence.jquery-min'
            ,'startSequence'
    ];
    var css = ['slidein-seqtheme'];
    addTo_Blocks(js, css);
    return '';
    //TODO
}

function makeFlexSlider(slides) {
    var js = [
        'jquery.easing.1.3'
        ,'jquery.flexslider-min'
        // 'startFlex'
    ];
    var css = ['flexslider'];
    addTo_Blocks(js, css);
    
    function makeSlide(s) {
        return '<li><img src="' + s.url + 
            '"><div class="slide-caption"><h3>' + 
            s.title + '</h3> </div> </li>';
    }
    // var slides = args.slides; 
    var str ='<div class="flexslider"><ul class="slides">';
    slides.forEach(function(s) {
        str += makeSlide(s);   
    });
    str += '</ul> </div>';
    return str;
}

function makeCameraSlider(slides) {
    var js = [
        // 'jquery.mobile.customized.min'
        'jquery.easing.1.3'
        ,'camera.min'
        // ,'startCamera'
    ];
    var css = ['camera'];
    addTo_Blocks(js, css);
    
    function makeSlide(s) {
        return '<div data-src=' + s.url +
            '><div class="camera_caption fadeFromLeft"><h4>' +
            s.title + '</h4>' + s.subtitle + '</div></div>'; 
    }
    // var slides = args.slides; 
    var str= '<div id="camera" class="camera_wrap">';
    slides.forEach(function(s) {
        str += makeSlide(s);   
    });
    str+='</div> </div>';
    return str;
}


function makeSlideShow(args) {
    var makers = {
        camera: makeCameraSlider,
        flex: makeFlexSlider,
        sequence: makeSequenceSlider
    };
    if (!makers[args.type]) return '';
    return makers[args.type](args.slides);
}

var uid = 1;
function makeShowHide(args) {
    if (uid === 1) {
        var js = [
            'showhide'
        ];
        var css = ['showhide'];
        addTo_Blocks(js, css);
    }
    
        
    var wrapper = getPartial(args.partialsDir, 'html/showhide');
    var wrappee = getPartial(args.partialsDir, args.showhide);
    wrapper = wrapper.replace(/uniqueid/g, 'showhide' + uid++);
    wrapper = wrapper.replace('inserthere', wrappee);
    return wrapper;
}

function render(args) {
    if (args.showhide) {
        return makeShowHide(args);
    }
    var partialsDir = args.partialsDir;
    if (!args.src) {
        log("Can't render partial. No source defined".red);
        log(args);
        return '';
    }
    
    var template = getPartial(partialsDir, args.src);
        
    args.mapping = args.mapping || [];
    
    var selector = {};
    Object.keys(args.mapping).forEach(function(tagId) {
        var partialIds = args.mapping[tagId];
        partialIds = util.isArray(partialIds) ? partialIds : [partialIds];
        
        var html = '';
        partialIds.forEach(function(partialId) {
            html += getPartial(partialsDir, partialId);
        });
        selector[tagId + args.tagIdPostfix] = html;
    });
    
    template = Plates.bind(template, selector); 
   
    if (args.prettyPrintHtml) {
        template = htmlFormatter.format(template,{
            indentSize: 4,
            maxLineLength: 10,
            indent: 2
        });
    }
    var str = args.src.green;
    if (args.out) {
        saveFile(args.root + args.pathOut + args.out, template);   
        str+= ' >> ' + args.out.blue;
        // log('>>' + args.out);
    }
    log(str);
    // log(template);
    
    return template;
}

function addProperties(o1,o2) {
    var newObject = {};
    o1 = o1 || {};
    o2 = o2 || {};
    Object.keys(o1).forEach(function(k) {
        newObject[k] = o1[k];
    });
    Object.keys(o2).forEach(function(k) {
        newObject[k] = o2[k];
    });
    return newObject;
} 

function makeUnaryTags(args) {
    var tag = args.tagType;
    var attrCollection = args.tags;
    var result = '';
    attrCollection = attrCollection || [];
    attrCollection.forEach(function(attrs) {
        result += makeTag(tag, attrs, true);
    });
    return  result + '\n';   
}

// function addDirToMonitor(partial) {
//    if (partial.partialsDir && monitoredDirs.indexOf(partial.partialsDir) === -1)
//        monitoredDirs.push(partial.partialsDir);
// }

function processPartials(partials) {
    uid = 1;
    partialsCollection = addProperties(defaultPartials, partials.ids);
    Object.keys(partials).forEach(function(k) {
        // addDirToMonitor(partials[k]);
        partials[k] = partials[k] || [];
        partials[k] = util.isArray(partials[k]) ? partials[k] : [partials[k]];
        partials[k].forEach(function(d) {
            var partial = makePartial(k, d);
            if (d.id) partialsCollection[d.id] = partial;
        });
    });
    // log(util.inspect(partialsCollection, { colors: true }));
}





function evalFile(fileName) {
    var file;
    try { file = fs.readFileSync(fileName, 'utf8');
          // console.log(file);
          eval(file);
          return exports;
        } catch (e) {
            console.log('Error reading data file: '.red, e);
            return undefined;
        }
} 

// function monitor(dataFileName) {
//     var isHtml = /.*\.html?$/;
//     var isMdown = /.*\.mdown?$/;
//     var isMarkdown = /.*\.markdown?$/;
//     var isMd = /.*\.md?$/;
//     // function puts(error, stdout, stderr) { sys.puts(stdout); }
//     // log(datajs);

//     var lastEvent = {
//         timestamp: '',
//         filename: ''
//     };
    
//     var onFileEvent = function (ev) {
//         // var filetype = ev.isDir ? "directory" : "file";
//         // log(ev.filename);
//         // var i = ev.filename.lastIndexOf('/');
//         // var dir = ev.filename.slice(0, i+1);
//         // log(dir, ev.filename);
//         if (ev.filename === dataFileName ||
//             // (target.indexOf(dir) !== -1 && (
//             isMdown.test(ev.filename) ||
//             isMarkdown.test(ev.filename) ||
//             isMd.test(ev.filename) || 
//             isHtml.test(ev.filename)
//             // || true
//            )
            
//             // ))
//         {
//             // log(ev.timestamp);
//             if (lastEvent.timestamp.toString() === ev.timestamp.toString() &&
//                 lastEvent.filename === ev.filename) return;
//             lastEvent = ev;
//             log('Modified>> '.green + ev.filename.yellow);
//             filemon.stop(function() {
//                 build();
                
//             });
//             // log('Building ' + buildData.out);
//             // exec("lispy -r " + ev.filename, puts);
//             // var buildData = evalFile(dataFileName);
//             // buildData.partialsPath = trailWith( buildData.partialsPath, '/');
//             // // log(buildData.title);
            
//             // render();
//             // log("Event " + ev.eventId + " was captured for " +
//             //             filetype + " " + ev.filename + " on time: " + ev.timestamp.toString());
//             // }
//         }
//     };
//     // var i = dataFileName.lastIndexOf('/');
//     // var dir = dataFileName.slice(0, i+1);
//     // target.push(dir);
//     // log(dir);
//     var options = {
//         target: monitoredDirs,
//         recursive: true,
//         listeners: {
//             modify: onFileEvent
//         }
//     };
    
//     log('Watching ' + monitoredDirs.toString());
//     filemon.watch(options); 
// } 


var builders = {
    metaBlock: { f: makeUnaryTags, defArgs: { tagType: 'meta'}}
    ,linkBlock: { f: makeStyleBlock }
    ,scriptBlock: { f: makeScriptBlock }
    ,slideShow:  { f: makeSlideShow }
    ,menu: { f: makeMenu }
    ,template: { f: render }
};

function makePartial(name, args) {
    var maker = builders[name];
    if (!maker) return '';
    args = addProperties(maker.defArgs, args);
    return maker.f(args);
}

var testing = true;
function build(dataFileName) {
    // var dataFileName = (argv._ && argv._[0]) || argv.file || '/home/michieljoris/www/firstdoor/data.js';
    if (!dataFileName)
        // dataFileName = (argv._ && argv._[0]) || argv.file ||
        dataFileName = process.cwd() + '/build/recipe.js';
    
    // try {
    var buildData = evalFile(dataFileName);
    var partialsDir;
    if (!buildData) {
        // console.log('Build data is undefined, so not building html.');
        buildData = {
            // monitor: true,
            verbose: true
        };
    }
    var paths = buildData.paths = buildData.paths || {};
    paths.root = trailWith(paths.root || process.cwd(), '/');
    paths.partials = trailWith( paths.partials || 'build', '/');
    // paths.monitor = trailWith( paths.monitor || 'build', '/');
    paths.out = trailWith( paths.out || 'built', '/');
    
    log = !buildData.verbose || !testing ?  function () {}: function() {
        console.log.apply(console, arguments); };
    
    
    buildData.tagIdPostfix = buildData.tagIdPostfix || '--';
        
    log('Cwd: ' + process.cwd());
    log('Root dir: ' + buildData.paths.root);
    
    partialsDir = buildData.paths.root + buildData.paths.partials;
    builders.template.defArgs = {
        root: paths.root,
        partialsDir: partialsDir,
        tagIdPostfix: buildData.tagIdPostfix,
        prettyPrintHtml: buildData.prettyPrintHtml,
        pathOut: paths.out
    };
    
    builders.linkBlock.defArgs = {
        partialsDir: partialsDir,
        css: 'css/'
    };
    
    builders.scriptBlock.defArgs = {
        partialsDir: partialsDir,
        js: 'js'
    };
    
    if (buildData.routes) {
        var routerJsString = getPartial(partialsDir, 'js/router.js');
        var routes  = makeRouterBlock(buildData.routes);
        // routes = '/*' + routes + '*/';
        routerJsString = routerJsString.replace(/inserthere/, routes);
        saveFile(paths.root + trailWith(paths.js, '/') + 'router.js', routerJsString);
    }
    
    
    // monitoredDirs = [];
    // if (partialsDir) monitoredDirs.push(partialsDir);
    // monitoredDirs = util.isArray(paths.monitor) ? paths.monitor : [paths.monitor];
    // console.log(buildData);
    
    // log(util.inspect(buildData, { colors: true }));
    processPartials(buildData.partials || {});
    
    // render();
    log('Finished rendering');
    // if (buildData.monitor) monitor(dataFileName);

}

// if (argv.h || argv.help) {
//     console.log([
//         "usage: html-builder [pathToData.js]"
//     ].join('\n'));
//     process.exit();
// }

exports.build = build;
