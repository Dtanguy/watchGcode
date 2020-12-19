require('dotenv').config();
let fs				= require ('fs.extra');
let path			= require("path");
let watch			= require('node-watch');
let OctoPrintServer	= require('octoprint');
var colors 			= require('colors');

var settings = {
	address: process.env.OCTOPRINT_ADRESS,
	APIKey: process.env.APIKEY//,
	//version: "0.1",
};
let server = new OctoPrintServer(settings);

var GCODE_HISTORY = process.env.HISTORY + 'watchgcode\gcode';
var STL_HISTORY = process.env.HISTORY + 'watchgcode\stl';
if (!fs.existsSync(process.env.HISTORY + 'watchgcode')){
    fs.mkdirSync(process.env.HISTORY + 'watchgcode');
}
if (!fs.existsSync(GCODE_HISTORY)){
    fs.mkdirSync(GCODE_HISTORY);
}
if (!fs.existsSync(STL_HISTORY)){
    fs.mkdirSync(STL_HISTORY);
}

let remoteFiles = {};
console.log('Home path : ' + colors.green(process.env.TO_WATCH));
console.log('Save path : ' + colors.green(GCODE_HISTORY));




watch(process.env.TO_WATCH, { recursive: true }, function(evt, name) {
	//console.log('Changed: ' + name);

	// Thing i don't want
	if(	evt == 'removed'            ||
		name.indexOf('.lnk')    > -1 || 
		name.indexOf(GCODE_HISTORY)  > -1 ||
		name.indexOf(STL_HISTORY)  > -1 ||
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
				console.log('New GCODE find : ' + colors.green(name) + ' evt: ' + evt + ' size: ' + stats["size"]);
				sendOctoprint(name, stats);					
			}

			// File is STL
			if( name.indexOf('.stl')  > -1 ) {
				// Slice it
				console.log('New STL find : ' + colors.green(name) + ' evt: ' + evt + ' size: ' + stats["size"]);
				slice(name, stats);
			}
			
		});
	}	
	
});






function sendOctoprint(name, stats){
	if(checkAlready(name, stats, function(){
		
		//let date = new Date(Date.now());
		//let new_name = path.join(GCODE_HISTORY, '[' + date.toISOString().replace(/T/, '_').replace(/\..+/, '').split(':').join('-') + ']_' + path.basename(name));
		let new_name = path.join(GCODE_HISTORY, path.basename(name).split('.')[0] + '-[' + Date.now() + ']' + '.gcode');

		fs.move (name, new_name, function (err) {
			if (err) {
				console.error(err);
				return;
			}
			console.warn('move to ' + colors.green(new_name));
			upload_to_octoprint(new_name);	
		});		
	}));
}


function slice(name, stats){
	//moveTo(name, process.env.STL_HISTORY);
}




function checkAlready(name, stats, callback){	
	server.getAllFiles().then(function(files, err){
		if (err) {
		  console.error(err);
		  return;
		}
		remoteFiles = files.files;
		console.log("Check " + colors.green(remoteFiles.length) + " Files name");
		for(let f in remoteFiles){
			//console.log("File name: " + remoteFiles[f].display + " Size: " + remoteFiles[f].size);
			if (remoteFiles[f].display == name.split("\\")[name.split("\\").length-1] && stats["size"] == remoteFiles[f].size){
				console.log('This file has already been seen ' + colors.green(new_name));
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
		console.error(red("Can't upload to " + process.env.OCTOPRINT_ADRESS));
		//console.error(err);
	});
}


