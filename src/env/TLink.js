import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'
import TParser from '@/run/TParser'
import TError from '@/utils/TError'
import TUtils from '@/utils/TUtils'

/**
 * TLink is the bridge between client and server.
 * It loads projects.
 * @exports TLink
 */

  const TLink = function () {

  /*
  var token = false;
  var userId = false;
  var projectId = false;
  var defaultprojectId = false;

  var resources = false;
  */

  this.setProjectId = value => {
    store.setProjectId(value)
  }

  const self = this

  const api = {

    authorizationToken: null,

    makeRequest(parameters, successCallback, errorCallback) {
      const defaultParameters = {
        global: false,
        beforeSend(request) {
          if (api.authorizationToken) {
            request.setRequestHeader(
              'Authorization',
              `Token ${api.authorizationToken}`
            )
          }
        },
        success(data) {
          successCallback.call(this, data)
        },
        error(data, status, error) {
          errorCallback.call(this, new TError(error))
        }
      }
      $.ajax($.extend(defaultParameters, parameters))
    },

    createResource(target, data, successCallback, errorCallback) {
      this.makeRequest({
        type: 'POST',
        url: TEnvironment.getBackendUrl(target),
        contentType: 'application/json',
        data: JSON.stringify(data)
      }, successCallback, errorCallback)
    },

    modifyResource(target, modifications, successCallback, errorCallback) {
      this.makeRequest({
        type: 'PATCH',
        url: TEnvironment.getBackendUrl(target),
        contentType: 'application/json',
        data: JSON.stringify(modifications)
      }, successCallback, errorCallback)
    },

    getResource(target, successCallback, errorCallback) {
      this.makeRequest({
        type: 'GET',
        url: TEnvironment.getBackendUrl(target),
        dataType: 'json'
      }, successCallback, errorCallback)
    },

    deleteResource(target, successCallback, errorCallback) {
      this.makeRequest({
        type: 'DELETE',
        url: TEnvironment.getBackendUrl(target)
      }, successCallback, errorCallback)
    },

    getTextFile(target, successCallback, errorCallback) {
      this.makeRequest({
        type: 'GET',
        url: TEnvironment.getBackendUrl(target),
        dataType: 'text'
      }, successCallback, errorCallback)
    },

    setTextFile(target, code, successCallback, errorCallback) {
      this.makeRequest({
        type: 'POST',
        url: TEnvironment.getBackendUrl(target),
        contentType: 'text/plain',
        data: code
      }, successCallback, errorCallback)
    },

    getBinaryFile(target, successCallback, errorCallback) {
      this.makeRequest({
        type: 'GET',
        url: TEnvironment.getBackendUrl(target),
        dataType: 'text'
      }, successCallback, errorCallback)
    },

    setBinaryFile(target, data, successCallback, errorCallback) {
      this.makeRequest({
        type: 'POST',
        url: TEnvironment.getBackendUrl(target),
        contentType: 'text/plain',
        data
      }, successCallback, errorCallback)
    }
  }

  var store = {

    userId: null,
    projectId: null,
    projectResources: null,

    resetUser() {
      store.userId = null
      store.projectId = null
      store.projectResources = null
    },

    setProjectId(value) {
      store.projectId = value
      store.projectResources = null
    },

    getUserId(successCallback, errorCallback) {
      if (store.userId) {
        return successCallback.call(self, store.userId)
      }
      api.getResource('authorizations', authorizations => {
        if (authorizations.length >= 1) {
          store.userId = authorizations[0].owner_id
          successCallback.call(self, store.userId)
        } else {
          errorCallback.call(new TError('user not connected'))
        }
      }, errorCallback)
    },

    getDefaultProjectId(successCallback, errorCallback) {
      this.getUserId(userId => {
        api.getResource(
          `users/${userId}/projects/default`,
          ({id}) => {
            successCallback.call(self, id)
          },
          errorCallback
        )
      }, errorCallback)
    },

    getProjectId(successCallback, errorCallback) {
      if (store.projectId) {
        successCallback.call(self, store.projectId)
      } else {
        this.getDefaultProjectId(projectId => {
          store.projectId = projectId
          successCallback.call(self, projectId)
          }
          , errorCallback)
      }
    },

    getProjectResources(successCallback, errorCallback) {
      if (store.projectId && store.projectResources) {
        return successCallback.call(self, store.projectResources,
          store.projectId)
      }
      this.getProjectId(projectId => {
        api.getResource(
          `projects/${projectId}/resources`,
          resources => {
            store.projectResources = resources
            successCallback.call(self, store.projectResources, projectId)
          },
          errorCallback
        )
      }, errorCallback)
    },

    getProjectResource(name, successCallback, errorCallback) {
      this.getProjectResources((resources, projectId) => {
        const match = resources.filter(({file_name}) => file_name === name)[0]
        if (match) {
          successCallback.call(self, match, projectId)
        } else {
          errorCallback.call(self, new TError('resource not found'))
        }
      }, errorCallback)
    },

    deleteProjectResource(name, successCallback, errorCallback) {
      this.getProjectResource(name, (resource, projectId) => {
        api.deleteResource(
          `projects/${projectId}/resources/${resource.id}`,
          () => {
            const index = store.projectResources.indexOf(resource)
            store.projectResources.splice(index, 1)
            successCallback.call(self, resource, projectId)
          },
          errorCallback
        )
      }, errorCallback)
    },

    createProjectScript(name, successCallback, errorCallback) {
      this.getProjectResources((resources, projectId) => {
        const script = {
            file_name: name,
            media_type: SCRIPT_MEDIA_TYPE
        }
        api.createResource(
          `projects/${projectId}/resources`,
          script,
          resource => {
            resources.push(resource)
            successCallback.call(self, resources, projectId)
          },
          errorCallback
        )
      }, errorCallback)
    },

    renameProjectScript(name, newName, successCallback, errorCallback) {
      this.getProjectResource(name, (resource, projectId) => {
        api.modifyResource(
          `projects/${projectId}/resources/${resource.id}`,
          modifications = {
            file_name: newName
          },
          resources => {
            resource.file_name = newName
            successCallback.call(self, resources, projectId)
          },
          errorCallback
        )
      })
    },

    getProjectScriptContent(name, successCallback, errorCallback) {
      this.getProjectResource(name, ({id}, projectId) => {
        api.getTextFile(
          `projects/${projectId}/resources/${id}/content`,
          successCallback,
          errorCallback
        )
      }, errorCallback)
    },

    setProjectScriptContent(name, code, successCallback, errorCallback) {
      this.getProjectResource(name, ({id}, projectId) => {
        api.setTextFile(
          `projects/${projectId}/resources/${id}/content`,
          code,
          successCallback,
          errorCallback
        )
      }, errorCallback)
    },

    createProjectAsset(name, successCallback, errorCallback) {
      this.getProjectResources((resources, projectId) => {
        let extension = ''
        if (name.includes('.')) {
          extension = name.split('.').pop()
        }
        let media_type = IMAGE_MEDIA_TYPES[extension]
        if (!media_type) {
          if (extension === 'html' || extension === 'htm') {
            media_type = HTML_MEDIA_TYPE
          } else {
            media_type = 'application/octet-stream'
          }
        }
        const asset = {
            file_name: name,
            media_type
        }
        api.createResource(
          `projects/${projectId}/resources`,
          asset,
          resource => {
            resources.push(resource)
            successCallback.call(self, resources, projectId)
          },
          errorCallback
        )
      }, errorCallback)
    },

    setProjectAssetContent(name, content, successCallback, errorCallback) {
      this.getProjectResource(name, (resource, projectId) => {
        api.setBinaryFile(
          `projects/${projectId}/resources/${resource.id}/content`,
          content,
          function () {
            successCallback.call(this, resource)
          },
          errorCallback
        )
      }, errorCallback)
    },

    renameProjectAsset(name, newBaseName, successCallback, errorCallback) {
      this.getProjectResource(name, (resource, projectId) => {
        let newName = newBaseName
        const extension = name.split('.').pop()
        if (extension) {
          newName += `.${extension}`
        }
        api.modifyResource(
          `projects/${projectId}/resources/${resource.id}`,
          modifications = {
            file_name: newName
          },
          resources => {
            resource.file_name = newName
            successCallback.call(self, newName)
          },
          errorCallback
        )
      }, errorCallback)
    },

    getProjectAssetContentLocation(name, withExtension) {
      // optimistic
      const resource = this.projectResources.filter(({file_name}) => file_name === name)[0]
      let target =
        `projects/${this.projectId || this.defaultProjectId}/resources/${resource.id}/content`
      if (withExtension) {
        for (const extension in IMAGE_MEDIA_TYPES) {
          if (resource.media_type === IMAGE_MEDIA_TYPES[extension]) {
            target += `.${extension}`
            break
          }
        }
      }
      return TEnvironment.getBackendUrl(target)
    },

    getProjectAssetContent(name, successCallback, errorCallback) {
      this.getProjectResource(name, ({id}, projectId) => {
        api.getBinaryFile(
          `projects/${projectId}/resources/${id}/content`,
          successCallback,
          errorCallback
        )
      }, errorCallback)
    }
  }

  TEnvironment.registerParametersHandler(parameters => {
      for (const name in parameters) {
          const value = parameters[name]
          switch (name) {
            case 'token':
              if (api.authorizationToken != value) {
                api.authorizationToken = value
                store.resetUser()
              }
              break
          }
      }
  })

  this.getAuthorizationToken = () => api.authorizationToken

  var SCRIPT_MEDIA_TYPE = 'text/vnd.colombbus.declick.script'

  this.getProgramList = callback => {
    store.getProjectResources((resources, projectId) => {
      const scriptNames = []
      resources.forEach(({media_type, file_name}) => {
        if (media_type === SCRIPT_MEDIA_TYPE) {
          scriptNames.push(file_name)
        }
      })
      callback.call(self, scriptNames, projectId)
    }, () => {
      callback.call(self, new TError('not connected'))
    })
  }

  var IMAGE_MEDIA_TYPES = {
    'gif': 'image/gif',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'png': 'image/png'
  }

  var HTML_MEDIA_TYPE = 'text/html'

  this.getResources = callback => {
    store.getProjectResources((resources, projectId) => {
      const formattedResources = {}
      resources.forEach(({media_type, file_name}) => {
        let isImage = false
        let isHtml = false
        for (var extension in IMAGE_MEDIA_TYPES) {
          if (media_type === IMAGE_MEDIA_TYPES[extension]) {
            isImage = true
            break
          }
        }
        if (media_type === HTML_MEDIA_TYPE) {
          isHtml = true
        }
        if (isImage || isHtml) {
          const parts = file_name.split('.')
          var extension = (parts.length >= 2) ? parts.pop() : ''
          const baseName = parts.join('.')
          formattedResources[file_name] = {
            type: (isImage && 'image') || (isHtml && 'text'),
            version: 0,
            extension,
            'base-name': baseName
          }
        }
      })
      callback.call(self, formattedResources, projectId)
    }, () => {
      callback.call(self, new TError('cannot retrieve resources'))
    })
  }

  this.getResource = function (name, callback) {
    this.getResources(resources => {
      callback.call(self, resources[name])
    }, callback)
  }

  this.getProgramCode = (name, callback) => {
    store.getProjectScriptContent(name, callback, callback)
  }

  this.getProgramStatements = (name, callback) => {
    store.getProjectScriptContent(name, content => {
      const statements = TParser.parse(content, name)
      callback.call(self, statements)
    }, callback)
  }

  this.saveProgram = (name, code, callback) => {
    store.getProjectResource(name, resource => {
      store.setProjectScriptContent(name, code, () => {
        callback.call(self)
      }, callback)
    }, callback)
  }

  this.createProgram = (name, callback) => {
    store.createProjectScript(name, () => {
      callback.call(self)
    }, callback)
  }

  this.renameProgram = (name, newName, callback) => {
    store.renameProjectScript(name, newName, () => {
      callback.call(self)
    }, callback)
  }

  this.deleteProgram = (name, callback) => {
    store.deleteProjectResource(name, () => {
      callback.call(self)
    }, callback)
  }

  this.createResource = (name, callback) => {
    store.createProjectAsset(name, () => {
      callback.call(self, name)
    }, callback)
  }

  this.saveResource = (name, data, callback) => {
    store.getProjectResource(name, resource => {
      store.setProjectAssetContent(name, data, () => {
        self.getResource(name, callback)
      }, callback)
    }, callback)
  }

  this.getResourceContent = (name, version, callback) => {
    store.getProjectAssetContent(name, callback, callback)
  }

  this.setResourceContent = function (name, data, callback) {
    this.saveResource(name, data, callback)
  }

  this.getResourceLocation = name => store.getProjectAssetContentLocation(name, true)

  this.getResourceUploadLocation = name => store.getProjectAssetContentLocation(name, false)

  this.renameResource = (name, newBaseName, callback) => {
    store.renameProjectAsset(name, newBaseName, callback, callback)
  }

  this.getSlideContent = (id, callback) => {
    const slideUrl = `${TEnvironment.getConfig('slide-url') + id}?access_token=jWNoVhWCng6odNLK`
    $.ajax({
        type: 'GET',
        url: slideUrl,
        dataType: 'json',
        success({content}) {
          callback.call(this, content)
        },
        error(data, status, error) {
          callback.call(this, new TError(error))
        }
      })
  }

  this.deleteResource = this.deleteProgram
}

const linkInstance = new TLink()

export default linkInstance
