define(['ui/TComponent', 'jquery', 'TEnvironment', 'TUI'], function(TComponent, $, TEnvironment, TUI) {
    function TToolbar(callback) {
        var $main, $buttonExecute;
        var $buttonDesignMode, $buttonConsole, $buttonSaveProgram, $buttonHints, $buttonWiki;
        var editorMode = false;
        var saveEnabled = false;
        var currentHeight = -1;

        TComponent.call(this, "TToolbar.html", function(component) {
            $main = component;
            $buttonExecute = component.find("#ttoolbar-play");
            $buttonDesignMode = component.find("#ttoolbar-design-mode");
            $buttonFloatingController =
                component.find("#ttoolbar-floating-controller");
            $buttonConsole = component.find("#ttoolbar-console");
            $buttonSaveProgram = component.find("#ttoolbar-save");

            $buttonWiki = component.find("#ttoolbar-wiki");
            $buttonWiki.prop("title", TEnvironment.getMessage('button-wiki'));
            $buttonWiki.click(function(e) {
                $buttonWiki.toggleClass("active");
                if (typeof window.parent !== 'undefined') {
                    window.parent.postMessage("toggleWiki", "*");
                }
            });

            $buttonHints = component.find("#ttoolbar-hints");
            $buttonHints.prop("title", TEnvironment.getMessage('button-hints'));
            $buttonHints.click(function(e) {
                TUI.toggleHints();
            });

            $buttonExecute.attr("title",TEnvironment.getMessage('button-execute'));
            $buttonExecute.click(function(e) {
                if (!$(this).is(':disabled')) {
                    TUI.execute();
                }
            });

            $buttonDesignMode.attr("title", TEnvironment.getMessage('option-design-mode'));
            $buttonDesignMode.click(function(e) {
                TUI.toggleDesignMode();
            });

            $buttonFloatingController.attr("title", TEnvironment.getMessage('option-floating-controller'));
            $buttonFloatingController.click(function(e) {
                TUI.toggleFloatingController();
            });

            $buttonConsole.attr("title", TEnvironment.getMessage('option-console'));
            $buttonConsole.click(function(e) {
                TUI.toggleConsole();
            });


            $buttonSaveProgram.attr("title", TEnvironment.getMessage('option-save-program'));
            $buttonSaveProgram.click(function(e) {
                if (!$(this).is(':disabled')) {
                    TUI.saveProgram();
                }
            });

            if (typeof callback !== 'undefined') {
                callback.call(this, component);
            }
        });

        this.mounted = function() {
        };

        this.enableConsole = function() {
            $buttonConsole.addClass("active");
        };

        this.disableConsole = function() {
            $buttonConsole.removeClass("active");
        };

        this.enableControllerMode = function() {
            $buttonControllerMode.addClass("active");
        };

        this.disableControllerMode = function() {
            $buttonControllerMode.removeClass("active");
        };

        this.enableDesignMode = function() {
            $buttonDesignMode.addClass("active");
        };

        this.disableDesignMode = function() {
            $buttonDesignMode.removeClass("active");
        };

        this.enableFloatingController = function() {
            $buttonFloatingController.addClass("active");
        };

        this.disableFloatingController = function() {
            $buttonFloatingController.removeClass("active");
        };

        this.enableEditor = function() {
            if (!editorMode) {
                $buttonDesignMode.hide();
                $buttonFloatingController.hide();
                $buttonConsole.hide();
                $buttonExecute.show();
                $buttonSaveProgram.show();
                editorMode = true;
            }
        };

        this.disableEditor = function() {
            if (editorMode) {
                $buttonDesignMode.show();
                $buttonFloatingController.show();
                $buttonConsole.show();
                $buttonExecute.hide();
                $buttonSaveProgram.hide();
                editorMode = false;
            }
        };

        this.setSaveEnabled = function(value) {
            saveEnabled = value;
            if (value) {
                $buttonSaveProgram.prop("disabled", false);
            } else {
                $buttonSaveProgram.prop("disabled", true);
            }
        };

        this.setSaveAvailable = function(value) {
            if (value && saveEnabled) {
                $buttonSaveProgram.addClass("active");
            } else {
                $buttonSaveProgram.removeClass("active");
            }
        };

        this.setHintsDisplayed = function(value) {
            if (value) {
                $buttonHints.addClass("active");
            } else {
                $buttonHints.removeClass("active");
            }
        };

        this.getHeight = function() {
            if (currentHeight === -1) {
                currentHeight = $main.outerHeight(false);
            }
            return currentHeight;
        };

        this.setWikiOpen = function() {
            $buttonWiki.addClass("active");
        };

        this.setWikiClosed = function() {
            $buttonWiki.removeClass("active");
        };
    }

    TToolbar.prototype = Object.create(TComponent.prototype);
    TToolbar.prototype.constructor = TToolbar;

    return TToolbar;
});
