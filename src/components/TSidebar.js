import $ from 'jquery'

import TComponent from '@/components/TComponent'
import TUI from '@/components/TUI'
import TEnvironment from '@/env/TEnvironment'
import TError from '@/utils/TError'
import TSidebarPrograms from '@/components/TSidebarPrograms'
import TSidebarResources from '@/components/TSidebarResources'

class TSidebar extends TComponent {
    constructor(callback) {
        let $sidebar
        let $switchPrograms
        let $switchResources
        let programs
        let resources

        super('TSidebar.html', function(component) {
            $sidebar = component
            $switchPrograms = component.find('#tsidebar-switch-programs')
            $switchPrograms.prop('title', TEnvironment.getMessage('switch-programs'))
            $switchPrograms.click(e => {
                TUI.togglePrograms()
            })
            $switchResources = component.find('#tsidebar-switch-resources')
            $switchResources.prop('title', TEnvironment.getMessage('switch-resources'))
            $switchResources.click(e => {
                TUI.toggleResources()
            })

            const self = this
            programs = new TSidebarPrograms(c => {
                component.find('#TSidebarPrograms').replaceWith(c)
                resources = new TSidebarResources(c => {
                    component.find('#TSidebarResources').replaceWith(c)
                    if (typeof callback !== 'undefined') {
                        callback.call(self, component)
                    }
                })
            })
        })

        /**
         * Display Sidebar.
         */
        this.mounted = function() {
            this.displayPrograms()
            programs.init()
            resources.init()
        }

        /**
         * Loads Programs and Resources.
         */
        this.load = () => {
            programs.load()
            resources.load()
        }

        /**
         * Update Programs.
         */
        this.updatePrograms = () => {
            programs.update()
        }

        this.updateResources = () => {
            resources.update()
        }

        this.update = function() {
            this.updatePrograms()
            this.updateResources()
        }

        this.updateProgramInfo = program => {
            programs.updateInfo(program)
        }

        this.showLoadingProgram = name => {
            programs.showLoading(name)
        }

        this.removeLoadingProgram = name => {
            programs.removeLoading(name)
        }

        this.showRenamingProgram = name => {
            programs.showRenaming(name)
        }

        this.showRenamingResource = name => {
            resources.showRenaming(name)
        }

        this.show = () => {
            $sidebar.show()
        }

        this.hide = () => {
            $sidebar.hide()
        }

        this.displayPrograms = () => {
            resources.hide()
            $switchResources.removeClass('active')
            $switchPrograms.addClass('active')
            $sidebar.stop().animate({ width: '260px' }, 200, () => {
                programs.show()
                programs.setEditionEnabled(programs.hasCurrent())
            })
        }

        this.displayResources = () => {
            if (!TEnvironment.isProjectAvailable()) {
                // Project is not available: we cannot manage resources
                const error = new TError(TEnvironment.getMessage('resources-unavailable-user-not-logged'))
                TUI.addLogError(error)
                return false
            }
            else {
                programs.hide()
                $switchPrograms.removeClass('active')
                $switchResources.addClass('active')
                $sidebar.stop().animate({ width: '440px' }, 200, () => {
                    resources.show()
                    resources.setEditionEnabled(resources.hasCurrent())
                })
                return true
            }
        }

        this.close = () => {
            programs.hide()
            resources.hide()
            $switchPrograms.removeClass('active')
            $switchResources.removeClass('active')
            $sidebar.stop().animate({ width: '65px' }, 200)
        }

        this.selectResource = name => {
            resources.select(name)
        }

        this.viewResource = name => {
            resources.view(name)
        }

        this.getCurrentResourceName = () => resources.getCurrentName()

        this.createResource = () => {
            resources.create()
        }

        this.setEditionEnabled = value => {
            programs.setEditionEnabled(value)
            resources.setEditionEnabled(value)
        }

        this.setProgramsEditionEnabled = value => {
            programs.setEditionEnabled(value)
        }

        this.setResourcesEditionEnabled = value => {
            resources.setEditionEnabled(value)
        }
    }
}

export default TSidebar
