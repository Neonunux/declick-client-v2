define(['jquery', 'TUtils', 'TEnvironment', 'TError', 'TParser'],
function($, TUtils, TEnvironment, TError, TParser) {
  /**
   * TLink is the bridge between client and server.
   * It loads projects.
   * @exports TLink
   */

    var remote = nodeRequire('electron').remote
    var app = remote.app
    var fs = remote.require('fs-extra')
    var path = remote.require('path')
    var fileUrl = remote.require('file-url')

    const dataFolder = "declick-data"
    const appDataFolder = "data"
    const coursesFolder = "courses"
    const assessmentsFolder = "assessments"
    const coursesFile = "courses.json"
    const assessmentsFile = "assessments.json"
    const slidesFolder = "slides"
    const resourcesFile = "resources.json"
    const courseImageFile = "course.png"
    const slideFile = "index.html"
    const userFile = "user.json"
    const resultsFolder = "results"
    const projectsFolder = "projects"
    const resultsFile = "results.json"
    const projectFile = "project.json"

    var TLink = function () {

    /*
    var token = false;
    var userId = false;
    var projectId = false;
    var defaultprojectId = false;

    var resources = false;
    */

    this.setProjectId = function (value) {
      store.setProjectId(value);
    }

    var self = this

    var store = {

      userId: null,
      projectId: null,
      projectResources: null,

      appFolder: path.format({dir: app.getAppPath(), base: appDataFolder}),
      assessmentsFolder: path.format({dir: path.join(app.getAppPath(), appDataFolder), base: assessmentsFolder}),
      slidesFolder: path.format({dir: path.join(app.getAppPath(), appDataFolder), base: slidesFolder}),
      usersFolder : path.format({dir: app.getPath("userData"), base: dataFolder}),

      resetUser: function() {
        store.userId = null;
        store.projectId = null;
        store.projectResources = null;
      },

      setProjectId: function(value) {
        if (value === false) {
          store.projectId = null;
        } else {
          store.projectId = value;
        }
        store.projectResources = null;
      },

      getUserId: function (successCallback, errorCallback) {
        if (store.userId === null) {
          errorCallback.call(new TError('user not connected'));
        }
        return successCallback.call(self, store.userId);
      },

      getDefaultProjectId: function (successCallback, errorCallback) {
        successCallback.call(self, 0);
      },

      getProjectId: function (successCallback, errorCallback) {
        if (store.projectId !== null) {
          successCallback.call(self, store.projectId);
        } else {
          this.getDefaultProjectId(function(projectId) {
            store.projectId = projectId;
            successCallback.call(self, projectId);
            }
            , errorCallback);
        }
      },
      getAssessmentFolder (id) {
        return path.format({dir: store.assessmentsFolder, base: id.toString()})
      },
      getUserFolder (id) {
        return path.format({dir: store.usersFolder, base: id.toString()})
      },      
      getProjectsFolder (userId) {
        return path.format({dir: store.getUserFolder(userId), base: projectsFolder})
      },
      getProjectFolder (userId, projectId) {
        return path.format({dir: store.getProjectsFolder(userId), base: projectId.toString()})
      },
      getProjectFile (userId, projectId) {
        return path.format({dir: store.getProjectFolder(userId, projectId), base: projectFile})
      },
      getAssessmentResourcesFile (id) {
        return path.format({dir: store.getAssessmentFolder(id), base: resourcesFile})
      },
      getProjectResourcesFile (id) {
        return path.format({dir: store.getProjectFolder(this.userId, id), base: resourcesFile})
      },
      getProjectResources: function (successCallback, errorCallback) {
        if (store.projectId!==null && store.projectResources) {
          return successCallback.call(self, store.projectResources,
            store.projectId);
        }
        this.getProjectId(function (projectId) {
          var resources;
          if (store.projectId < 0) {
            resources = JSON.parse(fs.readFileSync(store.getAssessmentResourcesFile(-projectId), {encoding: 'utf8'}));
          } else {
            resources = JSON.parse(fs.readFileSync(store.getProjectResourcesFile(projectId), {encoding: 'utf8'}));
          }
          store.projectResources = resources;
          successCallback.call(self, store.projectResources, projectId);
        }, errorCallback)
      },

      getProjectResource: function (name, successCallback, errorCallback) {
        this.getProjectResources(function (resources, projectId) {
          var match = resources.filter(function (resource) {
            return resource.file_name === name;
          })[0]
          if (match) {
            successCallback.call(self, match, projectId);
          } else {
            errorCallback.call(self, new TError('resource not found'));
          }
        }, errorCallback);
      },

      saveProjectResources: function() {
        fs.writeFileSync(this.getProjectResourcesFile(this.projectId), JSON.stringify(this.projectResources), {encoding: 'utf8'})
      },

      createProjectScript: function (name, successCallback, errorCallback) {
        this.getProjectResources(function (resources, projectId) {
          var script = {
              file_name: name,
              media_type: SCRIPT_MEDIA_TYPE,
              project_id: projectId
          }
          var id = 0;
          for (var i=0; i<resources.length;i++) {
            var resource = resources[i];
            if (resource.id>=id) {
              id = resource.id+1;
            }
          }
          script.id = id;
          resources.push(script);
          store.saveProjectResources();
          successCallback.call(self, resources, projectId);
        }, errorCallback)
      },

      renameProjectScript: function (name, newName, successCallback,
        errorCallback
      ) {
        this.getProjectResources(function (resources, projectId) {
          var id = 0;
          for (var i=0; i<resources.length;i++) {
            var resource = resources[i];
            if (resource.file_name === name) {
              resource.file_name = newName;
              break;
            }
          }
          store.saveProjectResources();
          successCallback.call(self, resources, projectId);
        }, errorCallback)
      },

      deleteProjectResource: function (name, successCallback, errorCallback) {
        this.getProjectResources(function (resources, projectId) {
          for (var i=0; i<resources.length;i++) {
            var resource = resources[i];
            if (resource.file_name == name) {
              resources.splice(i, 1);
              store.saveProjectResources();
              var resourceFile = path.format({dir: store.getProjectFolder(store.userId, projectId), base: resource.id.toString()});
              if (fs.existsSync(resourceFile)) {
                fs.removeSync(resourceFile);
              }
              break;
            }
          }
          successCallback.call(self, resources, projectId);
        }, errorCallback)
      },

      getProjectScriptContent: function (name, successCallback,
        errorCallback
      ) {
        this.getProjectResource(name, function (resource, projectId) {
          var content = ""
          if (projectId < 0) {
            content = fs.readFileSync(path.format({dir: store.getAssessmentFolder(-projectId), base: resource.id.toString()}), {encoding: 'utf8'});
          } else {
            var resourceFile = path.format({dir: store.getProjectFolder(store.userId, projectId), base: resource.id.toString()});
            if (fs.existsSync(resourceFile)) {
              content = fs.readFileSync(resourceFile, {encoding: 'utf8'});
            }
          }
          successCallback(content);
        }, errorCallback);
      },

      setProjectScriptContent: function (name, code, successCallback,
        errorCallback
      ) {
        this.getProjectResource(name, function (resource, projectId) {
          fs.writeFileSync(path.format({dir: store.getProjectFolder(store.userId, projectId), base: resource.id.toString()}), code, {encoding: 'utf8'});
          successCallback();
        }, errorCallback);
      },

      createProjectAsset: function (name, successCallback, errorCallback) {
        this.getProjectResources(function (resources, projectId) {
          var extension = ''
          if (name.indexOf('.') !== -1) {
            extension = name.split('.').pop();
          }
          var media_type = IMAGE_MEDIA_TYPES[extension];
          if (!media_type) {
            if (extension === 'html' || extension === 'htm') {
              media_type = HTML_MEDIA_TYPE;
            } else {
              media_type = 'application/octet-stream';
            }
          }
          var asset = {
              file_name: name,
              media_type: media_type,
              project_id: projectId              
          }
          var id = 0;
          for (var i=0; i<resources.length;i++) {
            var resource = resources[i];
            if (resource.id>=id) {
              id = resource.id+1;
            }
          }
          asset.id = id;
          resources.push(asset);
          store.saveProjectResources();
          successCallback.call(self, resources, projectId);
        }, errorCallback);
      },

      setProjectAssetContent: function (
        name,
        content,
        successCallback,
        errorCallback
      ) {
        this.getProjectResource(name, function (resource, projectId) {
          fs.writeFileSync(path.format({dir: store.getProjectFolder(store.userId, projectId), base: resource.id.toString()}), content);
          successCallback();
        }, errorCallback);
      },

      copyProjectAssetContent: function (
        name,
        srcPath,
        successCallback,
        errorCallback
      ) {
        this.getProjectResource(name, function (resource, projectId) {
          var base = resource.id.toString();
          for (var extension in IMAGE_MEDIA_TYPES) {
            if (resource.media_type === IMAGE_MEDIA_TYPES[extension]) {
              base += '.' + extension;
              break;
            }
          }          
          fs.copySync(srcPath, path.format({dir: store.getProjectFolder(store.userId, projectId), base: base}));
          successCallback(resource);
        }, errorCallback);
      },

      renameProjectAsset: function (name, newBaseName, successCallback,
        errorCallback
      ) {
        this.getProjectResources(function (resources, projectId) {
          var id = 0;
          for (var i=0; i<resources.length;i++) {
            var resource = resources[i];
            if (resource.file_name === name) {
              resource.file_name = newBaseName;
              break;
            }
          }
          store.saveProjectResources();
          successCallback.call(self, resources, projectId);
        }, errorCallback)
      },

      getProjectAssetContentLocation: function (name, withExtension) {
        // optimistic
        var resource = this.projectResources.filter(function (resource) {
          return resource.file_name === name;
        })[0];
        var target = "";
        if (withExtension) {
          for (var extension in IMAGE_MEDIA_TYPES) {
            if (resource.media_type === IMAGE_MEDIA_TYPES[extension]) {
              target = '.' + extension;
              break;
            }
          }
        }
        if (this.projectId < 0) {
          target = appDataFolder + "/" + assessmentsFolder + "/" + (-this.projectId) + "/" + resource.id.toString() + target;
          return TEnvironment.getBackendUrl(target);
        } else {
          var uri = fileUrl(this.getProjectFolder(this.userId, this.projectId)+ "/" + resource.id.toString() + target);
          return uri;
        }
      },

      getProjectAssetContent: function (name, successCallback, errorCallback) {
        this.getProjectResource(name, function (resource, projectId) {
          var content = "";
          if (projectId < 0) {
            content = fs.readFileSync(path.format({dir: store.getAssessmentFolder(-projectId), base: resource.id}), {encoding: 'utf8'});
          } else {
            var resourceFile = path.format({dir: store.getProjectFolder(this.userId, projectId), base: resource.id.toString()});
            if (fs.existsSync(resourceFile)) {
              content = fs.readFileSync(resourceFile, {encoding: 'utf8'});
            }
          }
          successCallback(content);
        }, errorCallback)
      }
    }

    TEnvironment.registerParametersHandler(function (parameters) {
        for (var name in parameters) {
            var value = parameters[name];
            switch (name) {
              case 'token':
                if (store.userId !== value) {
                  store.resetUser();
                  store.userId = value;
                }
                break
            }
        }
    })

    this.getAuthorizationToken = function () {
      return 0;
    }

    var SCRIPT_MEDIA_TYPE = 'text/vnd.colombbus.declick.script'

    this.getProgramList = function (callback) {
      store.getProjectResources(function (resources, projectId) {
        var scriptNames = []
        resources.forEach(function (resource) {
          if (resource.media_type === SCRIPT_MEDIA_TYPE) {
            scriptNames.push(resource.file_name)
          }
        })
        callback.call(self, scriptNames, projectId)
      }, function() {
        callback.call(self, new TError('not connected'));
      })
    }

    var IMAGE_MEDIA_TYPES = {
      'gif': 'image/gif',
      'jpeg': 'image/jpeg',
      'jpg': 'image/jpeg',
      'png': 'image/png'
    }

    var HTML_MEDIA_TYPE = 'text/html'

    this.getFormattedResource = function(resource) {
        var isImage = false
        var isHtml = false
        for (var extension in IMAGE_MEDIA_TYPES) {
          if (resource.media_type === IMAGE_MEDIA_TYPES[extension]) {
            isImage = true
            break
          }
        }
        if (resource.media_type === HTML_MEDIA_TYPE) {
          isHtml = true
        }
        if (isImage || isHtml) {
          var parts = resource.file_name.split('.')
          var extension = (parts.length >= 2) ? parts.pop() : ''
          var baseName = parts.join('.')
          return {
            type: (isImage && 'image') || (isHtml && 'text'),
            version: 0,
            extension: extension,
            'base-name': baseName
          }
        }
        return false;
    }

    this.getResources = function (callback) {
      var self = this;
      store.getProjectResources(function (resources, projectId) {
        var formattedResources = {}
        resources.forEach(function (resource) {
          var fResource = self.getFormattedResource(resource);
          if (fResource !== false) {
            formattedResources[resource.file_name] = fResource;
          }
        })
        callback.call(self, formattedResources, projectId)
      }, function() {
        callback.call(self, new TError('cannot retrieve resources'));
      })
    }

    this.getResource = function (name, callback) {
      this.getResources(function (resources) {
        callback.call(self, resources[name])
      }, callback)
    }

    this.getProgramCode = function (name, callback) {
      store.getProjectScriptContent(name, callback, callback)
    }

    this.getProgramStatements = function (name, callback) {
      store.getProjectScriptContent(name, function (content) {
        var statements = TParser.parse(content, name)
        callback.call(self, statements)
      }, callback)
    }

    this.saveProgram = function (name, code, callback) {
      store.getProjectResource(name, function (resource) {
        store.setProjectScriptContent(name, code, function () {
          callback.call(self)
        }, callback)
      }, callback)
    }

    this.createProgram = function (name, callback) {
      // TODO: check that name doesn't exist already
      store.createProjectScript(name, function () {
        callback.call(self)
      }, callback)
    }

    this.renameProgram = function (name, newName, callback) {
      store.renameProjectScript(name, newName, function () {
        callback.call(self)
      }, callback)
    }

    this.deleteProgram = function (name, callback) {
      store.deleteProjectResource(name, function () {
        callback.call(self)
      }, callback)
    }

    this.createResource = function (name, callback) {
      // TODO: check that name doesn't exist already
      store.createProjectAsset(name, function () {
        callback.call(self, name)
      }, callback)
    }

    this.saveResource = function (name, data, callback) {
      store.getProjectResource(name, function (resource) {
        store.setProjectAssetContent(name, data, function () {
          self.getResource(name, callback)
        }, callback)
      }, callback)
    }

    this.getResourceContent = function (name, version, callback) {
      store.getProjectAssetContent(name, callback, callback)
    }

    this.setResourceContent = function (name, data, callback) {
      this.saveResource(name, data, callback)
    }

    this.copyResourceContent = function (name, path, callback) {
      var self = this;
      store.copyProjectAssetContent(name, path, function (resource) {
        callback.call(self, self.getFormattedResource(resource));
      });
    }

    this.getResourceLocation = function (name) {
      return store.getProjectAssetContentLocation(name, true)
    }

    this.getResourceUploadLocation = function (name) {
      return store.getProjectAssetContentLocation(name, false)
    }

    this.renameResource = function (name, newBaseName, callback) {
      store.renameProjectAsset(name, newBaseName, callback, callback)
    }

    this.getSlideContent = function (id, callback) {
      var content = fs.readFileSync(path.format({dir: path.join(store.slidesFolder, id), base: 'index.html'}), {encoding: 'utf8'});
      callback.call(this, content);
    }

    this.deleteResource = this.deleteProgram
  };

  var linkInstance = new TLink();

  return linkInstance;
});
