# watchGcode
Tool for simplify STL / Gcode management for 3D printing with Octoprint.<br>
This will look in realtime for new gcode file on your system and upload them to Octoprint.
It will also move the file in a history directory, with a timestamp in name.

## Install
```js
	npm i
```

## Config

Rename '_config.js' to 'config.js' and complete it like follow :
```js
var config = {
	paths: {
		to_watch	: 'Path_of_the_folder_where_to_look_for_gcode_and_stl_file',
		gcode_history  	: 'Path_for_store_the_gcode_history',
		stl_history    	: 'Path_for_store_the_stl_history'
	},
	octoprint: {
		address		: 'http://YOUR_OCTOPRINT_ADRR:5000',
		APIKey		: 'YOUR_OCTOPRINT_API_KEY'
	}
};

module.exports = config;
```

## Usage
```js
	npm start
```