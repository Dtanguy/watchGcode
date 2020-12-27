# WatchGcode
A daemon for simplifying STL / Gcode management for 3D printing with Octoprint.
- Look in real time for new gcode file in a selected folder and upload it to Octoprint.
- Keep history of the files in a selected folder with a timestamp in name.
- [TODO] Automatically slice STL files
- Start printing the last uploaded Gcode
- [TODO] Small electron widget to select multiple printers and enable/disable PRINT_LAST_UPLOAD

## Installation
```js
npm i
```

## Configuration

Rename 'sample.env' to '.env' and complete it as follows :
```env
OCTOPRINT_ADRESS='http://xxx.xxx.xxx.xxx:5000'
APIKEY='OCTOPRINT_API_KEY'
TO_WATCH='C:\Users\you'
HISTORY='E:\Documents\'
PRINT_LAST_UPLOAD=TRUE
```

## Usage
```js
npm start
```