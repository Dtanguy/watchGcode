var fs              = require('fs');
var path            = require("path");
var watch           = require('node-watch');
var OctoPrintServer = require('octoprint');
var moveFile        = require('move-file');
var color			= require('./node_modules/nodeColor/color.js');

var config			= require('./config.js');
var lastSize  = -1;

var server = new OctoPrintServer(config.octoprint);


console.log('Home path : ' + config.paths.to_watch);
console.log('Save path : ' + config.paths.gcode_history);

 

watch(config.paths.to_watch, { recursive: true }, function(evt, name) {
	//console.log('Changed: ' + name);

	// Thing i dont want
	if(	evt == 'removed'            ||
		name.indexOf('.lnk')    > -1 || 
		name.indexOf(config.paths.gcode_history)  > -1 ||
		name.indexOf(config.paths.stl_history)  > -1 ||
		name.indexOf('AppData') > -1 ){
		return; 
	}	
	
	// 
	if( name.indexOf('.gcode') > -1 || name.indexOf('.stl')  > -1) {	
		fs.stat(name, function(err, stats) {
			if(err ||  stats["size"] < 1){
				console.log('nopSize');
				return;
			}
			
			// File is GCODE
			if( name.indexOf('.gcode') > -1 ) {
				//Send dat shit
				console.log('New GCODE find : ' + name + ' evt: ' + evt + ' size: ' + stats["size"]);
				upload_to_octoprint(name, stats);
			}

			// File is STL
			if( name.indexOf('.stl')  > -1 ) {
				// Slice dat shit
				console.log('New STL find : ' + name + ' evt: ' + evt + ' size: ' + stats["size"]);
			}
			
		});
	}
	
	
});



function upload_to_octoprint(name, stats){
	
	// Was already send
	if (stats["size"] == lastSize){
		console.log('This file has already been seen ' + name);
		return;
	}
	lastSize = stats["size"];

	
	// Send file to 3d printer
	console.log('uploading...');
	server.sendFile(name).then(function(response){
		console.log(response);		
		console.log('Succes !');
		
		/*
		{ 
			done: true,
			files: { 
				local: { 
					name: 'tepplllpst.gcode',
					origin: 'local',
					path: 'tepplllpst.gcode',
					refs: [Object] 
				} 
			} 
		}
		*/
		
		afterUpload(name);
	}).catch(function(err){
		console.error(err);
	});
	
}



function afterUpload(file){
	
	// Delet file ? Or move ?
	var name = path.basename(file);
	console.log('move ' + file + ' to ' + config.paths.gcode_history + name);
	
	//fs.rename(file, config.paths.gcode_history + name, function(err){
	//	if(err){
	//		console.log(err.red);
	//	}
		
	//});
	
	try{
		moveFile(file, config.paths.gcode_history + name);
	}catch(err){
		console.error('Move error', err);
	}
	
}



function getFilesizeInBytes(filename) {
    const stats = fs.statSync(filename)
    const fileSizeInBytes = stats.size
    return fileSizeInBytes
}




/*

var sending = false;


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
				console.log('This file has already been seen ' + name);
				if(sending == false){
					afterUpload(name);
				}
				return;
			}
			lastSize = stats["size"];
			sending = true;
			
			//File is OK to be send
			console.log('New Gcode find : ' + name + ' evt: ' + evt + ' size: ' + stats["size"]);
			
			//Send file to 3d printer
			console.log('uploading...');
			server.sendFile(name).then(function(response){
				console.log(response);		
				console.log('Succes !');
				afterUpload(name);
				sending = false;
			}).catch(function(err){
				console.error(err);
			});	
		
			
			
		});
	}
	*/
	
	
//console.log(process.cwd());
