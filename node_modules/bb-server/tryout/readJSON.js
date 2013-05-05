function readConfigFile(fileName) {
    try { var parsedJSON = require(fileName);
          console.log('Config file read.', parsedJSON.forward);
          return parsedJSON;
        } catch (e) {
            console.log('Config file not found.', e);
            return false;
        }
    
} 


readConfigFile('./test.json');
