require('dotenv').config();
const fs				= require('fs.extra');
const path				= require("path");
const colors 			= require('colors');
const watch				= require('node-watch');
//const OctoPrintServer	= require('octoprint');
const OctoPrint 		= require('./octo-client');


var settings = {
	address: process.env.OCTOPRINT_ADRESS,
	APIKey: process.env.APIKEY
};
//let server = new OctoPrintServer(settings);
OctoPrint.setupAPI(settings);

var BASE_HISTORY = path.join(process.env.HISTORY, "WatchGcode");
var GCODE_HISTORY = path.join(BASE_HISTORY, "gcode");
var STL_HISTORY = path.join(BASE_HISTORY, "stl");
var startJobTimeout;



async function loop(evt, name){
	//console.log('Changed: ' + name);

	// Thing i don't want
	if(	evt == 'removed'            		||
		name.indexOf('.lnk') > -1 			|| 
		name.indexOf(GCODE_HISTORY) > -1 	||
		name.indexOf(STL_HISTORY) > -1		||
		name.indexOf('AppData') > -1 ){
		return; 
	}	
	
	// Is Size ok ?
	var stats_;
	await new Promise((resolve, reject) => {
		fs.stat(name, function(err, stats) {	
			if(err ||  stats["size"] < 1){
				stats_ = -1;
				//reject();
			}else{
				stats_ = stats;
			}			
			resolve();
		});
	});
	if(stats_ == -1){
		//console.log("Ignore");
		return;
	}

	// File is GCODE
	if( name.indexOf('.gcode') > -1 ) {
		// Send it
		clearTimeout(startJobTimeout);
		console.log('New GCODE find : ' + colors.green(name) + ' evt: ' + evt + ' size: ' + stats_["size"]);		
		var res = false;
		await new Promise((resolve, reject) => {
			sendOctoprint(name, stats_, function(param){
				res = param;
				resolve();
			});
		});

		// Print it
		if(res && process.env.PRINT_LAST_UPLOAD == 'TRUE'){			
			startJobTimeout = setTimeout(printLastUpload, 10000);				
		}		
	}

	// File is STL
	if( name.indexOf('.stl')  > -1 ) {
		// Slice it
		console.log('New STL find : ' + colors.green(name) + ' evt: ' + evt + ' size: ' + stats_["size"]);
		slice(name, stats_);
	}

}





async function sendOctoprint(name, stats, cb){
	//if(checkAlready(name, stats, function(){		
		//let date = new Date(Date.now());
		//let new_name = path.join(GCODE_HISTORY, '[' + date.toISOString().replace(/T/, '_').replace(/\..+/, '').split(':').join('-') + ']_' + path.basename(name));
		let new_name = path.join(GCODE_HISTORY, path.basename(name).split('.')[0] + '-[' + Date.now() + ']' + '.gcode');

		fs.move (name, new_name, function (err) {
			if (err) {
				console.error(err);
				cb(false);
			}
			console.warn('move to ' + colors.green(new_name));
			//upload_to_octoprint(new_name, cb);
			OctoPrint.filesUpload(new_name, function(res2){
				console.log(res2);
				if(res2.status == 'Success'){
					cb(true);
				}
				cb(false);
			});
		});		
	//}));
}


function slice(name, stats){
	//moveTo(name, process.env.STL_HISTORY);
}



/*
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
*/


/*
async function upload_to_octoprint(name, cb){	
	// Send file to 3d printer
	console.warn('uploading... ');
	server.sendFile(name).then(function(response){	
		console.log('Succes !');
		cb(true);	
	}).catch(function(err){
		console.error(red("Can't upload to " + process.env.OCTOPRINT_ADRESS));
		cb(false);
	});					
}
*/



function printLastUpload(){
	//console.log("I print that");
	OctoPrint.printerState(function(res){
		//console.log(res);  

		// Is Printer ready ?
		try {
			if(res.state.flags.operational && !res.state.flags.printing){}
		} catch (error) {
			console.log("Printer not ready");  
			return;
		}		
	
		// List files
		console.log("Printer Ready"); 
		OctoPrint.files(true, function(res2){
			//console.log(res2);

			let last = {};
			try {
				let lastIt = 0;
				for (var i = 0; i < res2.files.length; i++){				
					//console.log(res2.files[i].date);
					if(res2.files[i].date > res2.files[lastIt].date){
						lastIt = i;
					}
				}
				last = res2.files[lastIt];
				console.log("Selected: " + last.name);
			} catch (error) {
				console.log("Error listing gcode");  
				return;
			}
			
			OctoPrint.selectFile(last.name, false, function(response){
				console.log(response);
				console.log("Start print");
			});

		});

	});
}







function main(){
	// Create needed folders
	if (!fs.existsSync(BASE_HISTORY)){
		fs.mkdirSync(BASE_HISTORY);
	}
	if (!fs.existsSync(GCODE_HISTORY)){
		fs.mkdirSync(GCODE_HISTORY);
	}
	if (!fs.existsSync(STL_HISTORY)){
		fs.mkdirSync(STL_HISTORY);
	}

	// Resume
	console.log('Home path : ' + colors.green(process.env.TO_WATCH));
	console.log('Save path : ' + colors.green(GCODE_HISTORY));
	console.log('Octoprint : ' + colors.green(process.env.OCTOPRINT_ADRESS));

	// Start watch
	watch(process.env.TO_WATCH, { recursive: true }, loop);
}
main();