var fs = require('fs');
function evalFile(fileName) {
    var file;
    try { file = fs.readFileSync(fileName, 'utf8');
          eval(file);
          return data;
        } catch (e) {
            console.log('Error reading data file: ', e);
            return undefined;
        }
} 

var bla = evalFile('data.js');
console.log(bla.styles);
