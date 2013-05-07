
/*global mode:false angular:false $:false jQuery:false console:false*/
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

myApp.value('ui.config', {
   tinymce: {
      // theme: 'simple'
   }
});

function DemoCtrl($scope) {
}

