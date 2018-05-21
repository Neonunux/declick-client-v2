# Declick Client v2

This component is part of [Declick v2 platform](https://github.com/colombbus/declick-v2).

## Installation

1. Install [yarn](https://yarnpkg.com/)
2. Run `yarn` to install dependencies
3. Run `yarn run build` to build project

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
yarn run build
```
Built files are located under the `dist` directory

## Development

Project uses webpack to compile, manage assets and create a development node server
1. yarn run serve
2. open `http://localhost:8080` in browser 
3. create a program named `autoload` to keep code in it through reloadings

## External libraries

Declick Clilent uses the following libraries:
* [Acorn parser](https://github.com/ternjs/acorn)
* [intro.js](http://introjs.com/)
* [jQuery File Upload](https://blueimp.github.io/jQuery-File-Upload/)
* [jQuery UI](https://jqueryui.com)
* [Neil Fraser's JS Interpreter](https://github.com/NeilFraser/JS-Interpreter)
* [France IOI PEM Task](https://github.com/France-ioi/pem-task)
* [wPaint.js](http://wpaint.websanova.com)

Will be removed
* [Prism](http://prismjs.com)
* [ACE Editor](https://ace.c9.io/)
* [jQuery](https://jquery.com)
* [JQuery split-pane plugin](https://github.com/shagstrom/split-pane)
* [Quintus](http://www.html5quintus.com)
* [JSChannel](https://github.com/mozilla/jschannel)

Soon:
* [three.js](https://threejs.org/)
* [Monaco editor](https://github.com/Microsoft/monaco-editor)