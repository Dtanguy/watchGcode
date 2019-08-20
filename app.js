var fs              = require('fs');
var path            = require("path");
var watch           = require('node-watch');
var OctoPrintServer = require('octoprint');
var moveFile        = require('move-file');
var colors = require('colors');


var watchPath = 'C:\\Users\\Tanguy\\';
var savePath  = 'C:\\Users\\Tanguy\\Documents\\gcode_history\\' ;
var lastSize  = -1;


var settingsUlti = {
	address: 'http://192.168.2.103:5000',
    APIKey:'6540C84339734D8FA8425A7119FD5289'
}

var settingsCr10 = {
	address: 'http://192.168.2.136:5000/',
    APIKey:'86D6DB3DFB0F40C69215E74F27B0E02C'
}

//var server = new OctoPrintServer(settingsUlti);
var server = new OctoPrintServer(settingsCr10);



console.log('Home path : '.cyan + watchPath.green);
console.log('Save path : '.cyan + savePath.green);


function getFilesizeInBytes(filename) {
    const stats = fs.statSync(filename)
    const fileSizeInBytes = stats.size
    return fileSizeInBytes
}


var sending = false;

watch(watchPath, { recursive: true }, function(evt, name) {
	//console.log('%s changed.', name);

	//Thing i dont want
	if(	evt == 'removed'            ||
		name.indexOf('.lnk')    > 0 || 
		name.indexOf(savePath)  > 0 ||
		name.indexOf('AppData') > 0 ){
		return; 
	}
	 
	
	//File is GCODE
	if( name.indexOf('.gcode') > 0 ) {
		fs.stat(name, function(err, stats) {
		
			if(err){
				console.log('nopSize'.red);
				//lastSize = -1;
				//afterUpload(name);
				return;
			}
			
			if (stats["size"] == lastSize || stats["size"] < 1){
				console.log('This file has already been seen '.magenta + name);
				if(sending == false){
					afterUpload(name);
				}
				return;
			}
			lastSize = stats["size"];
			sending = true;
			
			//File is OK to be send
			console.log('New Gcode find : ' + name.cyan + ' evt: ' + evt.cyan + ' size: ' + stats["size"]);
			
			//Send file to 3d printer
			console.log('uploading...'.cyan);
			server.sendFile(name).then(function(response){
				console.log(response);		
				console.log('Succes !'.green);
				afterUpload(name);
				sending = false;
			}).catch(function(error){
				console.log(error.red);
			});	
		
			
			
		});
	}
	

	//File is STL
	if( name.indexOf('.stl')  > 0 ) {
		//Slice dat shit
		console.log('New STL find : ' + name.cyan + ' evt: ' + evt.cyan);
	}
	
	
});


function afterUpload(file){
	//Delet file ? Or move ?
	var name = path.basename(file);
	console.log('move ' + file.cyan + ' to ' + savePath.cyan + name.cyan);
	/*
	fs.rename(file, savePath + name, function(err){
		if(err){
			console.log(err.red);
		}
		
	});*/
	
	try{
		moveFile(file, savePath + name);
	}catch(e){
		console.log('Move error'.red);
	}
	
}




