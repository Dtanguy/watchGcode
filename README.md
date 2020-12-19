# WatchGcode
A daemon for simplifying STL / Gcode management for 3D printing with Octoprint.
- Look in real time for new gcode file in a selected folder and upload it to Octoprint.
- Keep history of the files in a selected folder with a timestamp in name.
- [TODO] automatically slice STL files
- [TODO] Start printing the last uploaded Gcode

## Installation
```js
npm i
```

## Configuration

Rename 'sample.env' to '.env' and complete it like follow :
```env
TO_WATCH='C:\Users\you'
HISTORY='E:\Documents\'
OCTOPRINT_ADRESS='http://xxx.xxx.xxx.xxx:5000'
APIKEY='OCTOPRINT_API_KEY'
```

## Usage
```js
npm start
```