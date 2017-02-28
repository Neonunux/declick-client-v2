# Declick Client v2

This component is part of [Declick v2 platform](https://github.com/colombbus/declick-v2).


## Installation
1. Install [node.js](https://nodejs.org/)
2. Install [grunt](http://gruntjs.com)
3. Run `npm run install_declick`

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


## To build Declick:

Files located under src directory can be used for development. 

To get a compiled version for production, run:
```
grunt build_declick
```
Built files are located under the "dist" directory
