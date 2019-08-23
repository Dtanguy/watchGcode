let fs				= require ('fs.extra');
let path			= require("path");
let watch			= require('node-watch');
let OctoPrintServer	= require('octoprint');
let color			= require('nodeColor');

let config = require('./config.js');
let server = new OctoPrintServer(config.octoprint);
let remoteFiles = {};

console.log('Home path : ' + color.green(config.paths.to_watch));
console.log('Save path : ' + color.green(config.paths.gcode_history));


watch(config.paths.to_watch, { recursive: true }, function(evt, name) {
	//console.log('Changed: ' + name);

	// Thing i don't want
	if(	evt == 'removed'            ||
		name.indexOf('.lnk')    > -1 || 
		name.indexOf(config.paths.gcode_history)  > -1 ||
		name.indexOf(config.paths.stl_history)  > -1 ||
		name.indexOf('AppData') > -1 ){
		return; 
	}	
	
	// Thing i want
	if( name.indexOf('.gcode') > -1 || name.indexOf('.stl')  > -1) {	
		fs.stat(name, function(err, stats) {
			if(err ||  stats["size"] < 1){
				return;
			}
			
			// File is GCODE
			if( name.indexOf('.gcode') > -1 ) {
				// Send it
				console.log('New GCODE find : ' + color.green(name) + ' evt: ' + evt + ' size: ' + stats["size"]);
				sendOctoprint(name, stats);					
			}

			// File is STL
			if( name.indexOf('.stl')  > -1 ) {
				// Slice it
				console.log('New STL find : ' + color.green(name) + ' evt: ' + evt + ' size: ' + stats["size"]);
				slice(name, stats);
			}
			
		});
	}	
	
});






function sendOctoprint(name, stats){
	if(checkAlready(name, stats, function(){
		
		let date = new Date(Date.now());
		let new_name = path.join(config.paths.gcode_history, '[' + date.toISOString().replace(/T/, ' ').replace(/\..+/, '').split(':').join('-') + '] ' + path.basename(name));
						
		fs.move (name, new_name, function (err) {
			if (err) {
				console.error(err);
				return;
			}
			console.warn('move ' + color.green(name) + ' to ' + color.green(new_name));
			upload_to_octoprint(new_name);	
		});
		
	}));
}


function slice(name, stats){
	//moveTo(name, config.paths.stl_history);
}




function checkAlready(name, stats, callback){	
	server.getAllFiles().then(function(files, err){
		if (err) {
		  console.error(err);
		  return;
		}
		remoteFiles = files.files;
		console.log("Check " + color.green(remoteFiles.length) + " Files name");
		for(let f in remoteFiles){
			//console.log("File name: " + remoteFiles[f].display + " Size: " + remoteFiles[f].size);
			if (remoteFiles[f].display == name.split("\\")[name.split("\\").length-1] && stats["size"] == remoteFiles[f].size){
				console.log('This file has already been seen ' + color.green(new_name));
				console.warn('DELETE');
				fs.unlinkSync(name);
				return;
			}
		}
		callback();		
	});
}




function upload_to_octoprint(name){	
	// Send file to 3d printer
	console.warn('uploading... ');
	server.sendFile(name).then(function(response){
		//console.log(response);		
		console.log('Succes !');
		//updateRemoteFiles();
	}).catch(function(err){
		console.error(err);
	});
}


