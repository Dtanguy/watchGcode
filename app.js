let fs              = require('fs');
let path            = require("path");
let watch           = require('node-watch');
let OctoPrintServer = require('octoprint');
let moveFile        = require('move-file');
let color			= require('./node_modules/nodeColor/color.js');

let config			= require('./config.js');
let lastSize  = -1;

let server = new OctoPrintServer(config.octoprint);


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
				slice(name, stats);
			}
			
		});
	}
	
	
});



function upload_to_octoprint(name, stats){	
	// Was already send
	if (stats["size"] == lastSize){
		console.log('This file has already been seen ' + name);
		console.warn('DELETE');
		fs.unlinkSync(name);
		return;
	}
	lastSize = stats["size"];

	
	// Send file to 3d printer
	console.warn('uploading...');
	/*server.sendFile(name).then(function(response){
		console.log(response);		
		console.log('Succes !');
		moveTo(name);
	}).catch(function(err){
		console.error(err);
	});*/
	
	let res = { 
		done: true,
		files: { 
			local: { 
				name: 'tepplllpst.gcode',
				origin: 'local',
				path: 'tepplllpst.gcode',
				refs: [Object] 
			} 
		} 
	};
	console.log(res);
	moveTo(name,config.paths.gcode_history);	
}



function slice(name, stats){
	moveTo(name, config.paths.stl_history);
}


function moveTo(file, dir){	
	// Move file
	let name = path.basename(file);
	console.warn('move ' + file + ' to ' + dir + '\\' + name);	
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}
	try{
		let date = new Date(Date.now());
		moveFile(file, dir + '\\' + '[' + date.toISOString().replace(/T/, ' ').replace(/\..+/, '').split(':').join('-') + '] ' + name);
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

// Delet file ? Or move ?
	//fs.rename(file, config.paths.gcode_history + name, function(err){
	//	if(err){
	//		console.log(err.red);
	//	}
		
	//});
	
	
	
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
