# Declick Client v2

This component is part of [Declick v2 platform](https://github.com/colombbus/declick-v2).


## Installation
1. Install [node.js](https://nodejs.org/)
2. Install [grunt](http://gruntjs.com)
3. Run `npm run install_declick`
   - On Win system, `npm` can stop install on `fsevents` can cause an error; `fsevents` is needed by `chokidar` on MacOs, himself needed by `webpack`. No needed on win. A dirty way to pass through is to delete this dependency on `package.json` of `chokidar` in your `node_modules`

## Configuration

Go to *src/resources* and copy *config.dist.json* to *config.json* - change parameters according to your configuration:
* **backend-path**: path to the server's endpoint (should be on the same machine/domain). See [declick-server](https://github.com/colombbus/declick-server-v2)
* **wpaint-path**: relative path to the lib wpaint (should not be modified)
* **slide-url**: path to the server providing slides in exercise mode. These slides are included using an iframe. Slide url is computed from this parameter and slide id appended.
* **cache**: true/false, use localStorage to store components and objects
* **debug**: true/false, display debug messages in console 
* **log**: true/false, display log messages in console
* **error**: true/false, display error messages in console
* **cache-version**: integer, used by build script for cache management
* **optimized**: true/false, should be set to false: used by build script to identify compiled sources
* **analytics**: false/path to an optional js script that would be included in every page (for stats). The path is relative to the application root.


## Build

Files located under src directory can be used for development. 

To get a compiled version for production, run:
```
grunt build_declick
```
Built files are located under the "dist" directory

## External libraries

Declick Clilent uses the following libraries:
* [Acorn parser](https://github.com/ternjs/acorn)
* [ACE Editor](https://ace.c9.io/)
* [BabylonJS](http://babylonjs.com)
* [intro.js](http://introjs.com/)
* [jQuery](https://jquery.com)
* [jQuery File Upload](https://blueimp.github.io/jQuery-File-Upload/)
* [jQuery UI](https://jqueryui.com)
* [Neil Fraser's JS Interpreter](https://github.com/NeilFraser/JS-Interpreter)
* [JSChannel](https://github.com/mozilla/jschannel)
* [France IOI PEM Task](https://github.com/France-ioi/pem-task)
* [Prism](http://prismjs.com)
* [Quintus](http://www.html5quintus.com)
* [RequireJS](http://requirejs.org)
* [JQuery split-pane plugin](https://github.com/shagstrom/split-pane)
* [wPaint.js](http://wpaint.websanova.com)
