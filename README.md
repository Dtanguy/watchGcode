# watchGcode
Daemon for simplify STL / Gcode management for 3D printing with Octoprint.<br>
Look in realtime for new gcode file in a selected folder and upload it to Octoprint.
It will also move the file in a history directory, with a timestamp.

## Install
```js
npm i
```

## Config

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