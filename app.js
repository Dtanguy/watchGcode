let fs 				= require ('fs.extra');
let path            = require("path");
let watch           = require('node-watch');
let OctoPrintServer = require('octoprint');
let color			= require('./node_modules/nodeColor/color.js');

let config			= require('./config.js');
let lastSize  = -1;

let server = new OctoPrintServer(config.octoprint);
let remoteFiles = {};

console.log('Home path : ' + color.green(config.paths.to_watch));
console.log('Save path : ' + color.green(config.paths.gcode_history));


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
	
	// Thing i want
	if( name.indexOf('.gcode') > -1 || name.indexOf('.stl')  > -1) {	
		fs.stat(name, function(err, stats) {
			if(err ||  stats["size"] < 1){
				//console.log('nopSize');
				return;
			}
			
			// File is GCODE
			if( name.indexOf('.gcode') > -1 ) {
				// Send dat shit
				console.log('New GCODE find : ' + color.green(name) + ' evt: ' + evt + ' size: ' + stats["size"]);
				sendOctoprint(name, stats);					
			}

			// File is STL
			if( name.indexOf('.stl')  > -1 ) {
				// Slice dat shit
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














































/*






function updateRemoteFiles(){
	server.getAllFiles().then(function(files, err){
		if (err) {
		  console.error(err);
		  return;
		}
		remoteFiles = files.files;
		for(let f in files.files){
			console.log("File name: " + files.files[f].display + " Size: " + files.files[f].size);
		}
	});
}










function checkAlready(name, stats, callback){
	
	server.getAllFiles().then(function(files, err){
		if (err) {
		  console.error(err);
		  return;
		}
		remoteFiles = files.files;
		
		
		for(let f in files.files){
			console.log("File name: " + files.files[f].display + " Size: " + files.files[f].size);
		}
		
	});
	
	callback();
	
	for(let f in remoteFiles){
		if (remoteFiles[f].display == name.split("\\")[name.split("\\").length-1] && stats["size"] == remoteFiles[f].size){
			console.log('This file has already been seen ' + name);
			console.warn('DELETE');
			fs.unlinkSync(name);
			return true;
		}
		//console.log("File name: " + remoteFiles[f].display + " Size: " + remoteFiles[f].size);
	}	
	return false;
}













let new_name = moveTo(name, config.paths.gcode_history);
upload_to_octoprint(new_name, stats);		
					
function moveTo(file, dir, callback){	
	// Move file
	let name = path.basename(file);
	let date = new Date(Date.now());
	let new_name = path.join(dir, '[' + date.toISOString().replace(/T/, ' ').replace(/\..+/, '').split(':').join('-') + '] ' + name);
	console.warn('move ' + file + ' to ' + dir + '\\' + new_name);	
	
	
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}
	//try{
		fs.renameSync(file, new_name);
		//move(file, new_name, callback);
		//moveFile(file, new_name);
		return new_name;
	//}catch(err){
	//	console.error('Move error', err);
	//	return -1;
	//}	
}




function move(oldPath, newPath, callback) {

    fs.rename(oldPath, newPath, function (err) {
        if (err) {
            if (err.code === 'EXDEV') {
                copy();
            } else {
                callback(err);
            }
            return;
        }
        callback(newPath);
    });

    function copy() {
        var readStream = fs.createReadStream(oldPath);
        var writeStream = fs.createWriteStream(newPath);

        readStream.on('error', callback);
        writeStream.on('error', callback);

        readStream.on('close', function () {
            fs.unlink(oldPath, callback);
        });

        readStream.pipe(writeStream);
    }
}
*/


/*







	// Was already send
	
	if (stats["size"] == lastSize){
		console.log('This file has already been seen ' + name);
		console.warn('DELETE');
		fs.unlinkSync(name);
		return;
	}
	lastSize = stats["size"];
	
	
	

function getFilesizeInBytes(filename) {
    const stats = fs.statSync(filename)
    const fileSizeInBytes = stats.size
    return fileSizeInBytes
}
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
