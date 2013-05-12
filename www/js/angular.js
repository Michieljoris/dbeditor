/*global Cookie:false tinymce:false mode:false angular:false $:false jQuery:false console:false*/
/*jshint strict:false unused:true smarttabs:true eqeqeq:true immed: true undef:true*/
/*jshint maxparams:7 maxcomplexity:7 maxlen:150 devel:true newcap:false*/ 

console.log("Started..");
// var mode = 'edit';
var myApp= angular.module('myApp', ['ui', 'ui.bootstrap'])
    .directive('compile', function($compile) {
        // directive factory creates a link function
        return function(scope, element, attrs) {
            scope.$watch(
                function(scope) {
                    // watch the 'compile' expression for changes
                    return scope.$eval(attrs.compile);
                },
                function(value) {
                    // when the 'compile' expression changes
                    // assign it into the current DOM
                    element.html(value);
 
                    // compile the new DOM and link it to the current
                    // scope.
                    // NOTE: we only compile .childNodes so that
                    // we don't get into infinite loop compiling ourselves
                    $compile(element.contents())(scope);
                }
            );
        };

        
    });

myApp.factory('dbclient', function() {
    var client = new Dropbox.Client({
        key: "YeCJco4amaA=|7eogAPTXNNSaOarGEGSn/boHZPPRNkBlv3+T2KX9Og==",
        sandbox: false
    });

    client.authDriver(new Dropbox.Drivers.Redirect({ rememberUser: true }));
    
    return client;
});


function getUserInfo(client, $scope) {
    client.getUserInfo(function(error, userInfo) {
        if (error) {
            showError(error);  // Something went wrong.
            userInfo = {};
        }

        $scope.userInfo = userInfo;
        // console.log(userInfo);
        $scope.$apply();
    });
    
}
function readDir($scope, dbclient) {
    
    dbclient.readdir("/", function(error, entries) {
        if (error) {
            showError(error);  // Something went wrong.
            entries = [];
        }
        // console.log(entries);
        $scope.entries=entries;
        $scope.$apply();
    });

}

function readFile($scope, dbclient, fileName) {
    dbclient.readFile(fileName, function(error, data) {
        if (error) {
            showError(error);  // Something went wrong.
            data = ""; 
            $scope.fileName = "";
        }
        else {
            $scope.fileName = '/dropbox' + fileName;
        }
        $scope.$apply();
        console.log(data);
        $("#myeditor").tinymce().setContent(data);
        editor.importFile(fileName, data);
    });
}

function writeFile($scope, dbclient, content) {
    if (!$scope.fileName) {
        console.log("Error: File name is not set!! Not saving..");
        return;
    }
    console.log($scope.fileName);
    var fileName = $scope.fileName;
    if (fileName.indexOf('/dropbox') !== -1) {
        fileName = fileName.slice(8);
    }
    dbclient.writeFile(fileName, content, function(error, stat) {
        if (error) {
            showError(error);  // Something went wrong.
        }
        else {
            console.log("Saved!", stat);
        }
    });
}

function doSomething(dbclient, $scope) {
    $scope.authenticated = true;
    getUserInfo(dbclient, $scope);
    var path = Cookie.get("dbeditorPath") || '/';
    // readDir($scope, dbclient);
    $scope.fileClick({
        path: path,
        name: '[up]',
        isFolder: true
    });
    // getMetaData(dbclient, path, function() {
    //     var rootStat = allMetaData[path];
    //     $scope.pathArray = makePathArray(path);
    //     rootStat.path = path;
        
    //     if (path !== '/')  {
    //         var metaData = allMetaData[path];
    //         if (!metaData) {
    //             metaData = {
    //                 path: path,
    //                 name: '[up]',
    //                 isFolder: true
    //             };
    //         }
    //         $scope.entries = [metaData].concat(stat.contents);
    //     }
    //     else
    //         $scope.entries = stat.contents;
        
        
    //     $scope.entries = rootStat.contents;
    //     $scope.$apply();
    // });
}

function clearScreen($scope) {
    $scope.authenticated = false;
    $scope.entries = [];
    $scope.userInfo = {};
    // $("#myeditor").tinymce().setContent("Sign in to dropbox!!");
    // editor.importFile('dummy', 'Sign in to dropbox!!');
    $scope.$apply();
}

function makePathArray(fullPath) {
    var result = [];
    if (fullPath === '/') return [allMetaData['/']];
    var arr = fullPath.split('/');
    var path = '';
    arr.forEach(function(e) {
        path += '/' + e;
        var metaData = allMetaData[path];
        if (!metaData) {
            metaData = {
                path: path,
                realName: e || 'dropbox',
                isFolder: true
            };
            
        }
        result.push(metaData);
        if (e === '') path = '';
        // console.log(e);
    });
    console.log(result);
    return result;
}

    
var editor;
function initEpicEditor() {
    console.log('epiceditor');
    var opts = {
        container: 'epiceditor',
        textarea: null,
        basePath: 'epiceditor',
        clientSideStorage: true,
        localStorageName: 'epiceditor',
        useNativeFullsreen: true,
        // parser: marked,
        file: {
            name: 'epiceditor',
            defaultContent: '',
            autoSave: 100
        },
        theme: {
            base: '/themes/base/epiceditor.css',
            preview: '/themes/preview/bartik.css',
            editor: '/themes/editor/epic-dark.css'
        },
        button: {
            preview: true,
            fullscreen: true
        },
        focusOnLoad: false,
        shortcut: {
            modifier: 18,
            fullscreen: 70,
            preview: 80
        },
        string: {
            togglePreview: 'Toggle Preview Mode',
            toggleEdit: 'Toggle Edit Mode',
            toggleFullscreen: 'Enter Fullscreen'
        }
    };
    editor = new EpicEditor(opts);
    editor.load(function () {
        console.log("Editor loaded.");
    });
    
}


function MainCntl($scope, dbclient) {
    console.log("In MainCntl") ;
    $scope.signin = function() {
        dbclient.reset();
        dbclient.authenticate(function(error, client) {
            if (error) {  showError(error); }
            console.log('authenticating');
            // doSomethingCool();
        });
        
    };
    
    $scope.signout = function() {
        dbclient.signOut();
        // console.log(dbclient.isAuthenticated());
        setTimeout(function() {
            clearScreen($scope);
        }, 1);
        // $scope.$apply();
    };
    
    $scope.fileClick = function(entry) {
        // console.log(entry);
        if (entry.isFolder) {
            getMetaData(dbclient, entry.path, function(stat) {
                if (!stat) {
                    console.log("Error. Couldn't get stat for " + entry.path);
                    return;
                }
                Cookie.set("dbeditorPath", entry.path);
                var parent = entry.path.slice(0, entry.path.lastIndexOf('/'));
                if (parent === "") parent = "/";
                // console.log($scope.pathArray);
                if (entry.path !== '/')  {
                    var metaData = allMetaData[parent];
                    if (!metaData) {
                        metaData = {
                            path: parent,
                            // realName: e || 'dropbox',
                            name: '[up]',
                            isFolder: true
                        };
            
                    }
                    $scope.entries = [metaData].concat(stat.contents);
                }
                else
                    $scope.entries = stat.contents;
                $scope.pathArray = makePathArray(entry.path);
                $scope.$apply();
                
            });
            
        }
        else readFile($scope, dbclient, entry.path);
    };
    
    tinymce.settings.save_onsavecallback= function() {
        var content = $("#myeditor").tinymce().getContent();
        writeFile($scope, dbclient, content);
        return true;
    };
    
    $scope.saveMarkdown = function() {
        var content = editor.exportFile();
        writeFile($scope, dbclient, content);
    };
    
    initEpicEditor();
    // setTimeout(function() {
    //     console.log("timed out");
    // },2000) ;
    
    
    window.client = dbclient;
    dbclient.authenticate({interactive: false}, function(error, client) {
        console.log("is authenticated?",client.isAuthenticated());
        if (!client.isAuthenticated()) {
            $scope.authenticated = false;
            return;
        }
        if (error) {  showError(error); }
        else {
            setTimeout(function() {
                doSomething(dbclient, $scope);
            }, 1);
        }
    });
    
    
}



var allMetaData = {};

function getMetaData(dbclient, path, callback) {
    var options = {
        readDir: true,
        versionTag: allMetaData[path] ? allMetaData[path].versionTag : ''
    };
    console.log("Getting metadata for " + path);
    dbclient.stat(path, options, function(error, stat, contents){
        if (error)  {
            if (error === 304) {
                console.log("304");
                callback(allMetaData[path]);
                return;   
            }
            console.log("error in retrieving metadata for " + path);
            console.log("reason:", error);
            callback();
            return;
        }
        if (!stat.isFolder) {
            // console.log("Retrieved metadata for file " + path);
            callback();
            return;
        }
        // console.log('stat for ' + path + ' is ' , stat);
        // console.log('contents for ' + path + ' is ' , contents);
        contents.forEach(function(c) {
            if (c.isFolder) {
                c.name += '/';
            }
        });
        stat.contents = contents;
        stat.realName = stat.name || 'dropbox';
        stat.name = '[up]';
        allMetaData[path] = stat;
        callback(stat);
    });
}

// function buildMetaData(dbclient, path, done) {
//     console.log('building metadata');
//     getMetaData(dbclient, path, function(metaData) {
//         if (metaData && metaData.contents) {
//             var dirCount = 0;
//             metaData.contents.forEach(function(c) {
//                 if (c.isFolder) dirCount++;
//             });
//             if (!dirCount) done();
//             else {
//                 metaData.contents.forEach(function(c) {
//                     if (c.isFolder) {
//                         c.name += '/';
//                         buildMetaData(dbclient, c.path, function() {
//                             dirCount--;
//                             if (!dirCount) done(); 
//                         });
//                     }
//                 });
//             } 
//         } 
//         else done();
//     });
// }


var showError = function(error) {
  switch (error.status) {
  case Dropbox.ApiError.INVALID_TOKEN:
    // If you're using dropbox.js, the only cause behind this error is that
    // the user token expired.
    // Get the user through the authentication flow again.
      console.log(1);
    break;

  case Dropbox.ApiError.NOT_FOUND:
    // The file or folder you tried to access is not in the user's Dropbox.
    // Handling this error is specific to your application.
      console.log(2);
    break;

  case Dropbox.ApiError.OVER_QUOTA:
    // The user is over their Dropbox quota.
    // Tell them their Dropbox is full. Refreshing the page won't help.
      console.log(3);
    break;

  case Dropbox.ApiError.RATE_LIMITED:
    // Too many API requests. Tell the user to try again later.
    // Long-term, optimize your code to use fewer API calls.
      console.log(4);
    break;

  case Dropbox.ApiError.NETWORK_ERROR:
    // An error occurred at the XMLHttpRequest layer.
    // Most likely, the user's network connection is down.
    // API calls will not succeed until the user gets back online.
      
      console.log(5);
    break;

  case Dropbox.ApiError.INVALID_PARAM:
  case Dropbox.ApiError.OAUTH_ERROR:
  case Dropbox.ApiError.INVALID_METHOD:
  default:
      
      console.log(6);
    // Caused by a bug in dropbox.js, in your application, or in Dropbox.
    // Tell the user an error occurred, ask them to refresh the page.
  }
};


