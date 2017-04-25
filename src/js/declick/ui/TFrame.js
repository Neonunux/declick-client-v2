define(['ui/TComponent', 'jquery', 'split-pane', 'ui/TCanvas', 'ui/TEditor', 'ui/TSidebar', 'TUI', 'ui/TConsole', 'ui/TToolbar', 'ui/TLog', 'ui/TMessage', 'TRuntime', 'TEnvironment', 'ui/THints'], function(TComponent, $, SplitPane, TCanvas, TEditor, TSidebar, TUI, TConsole, TToolbar, TLog, TMessage, TRuntime, TEnvironment, THints) {
    function TFrame(callback) {
        var initialized = false;
        var canvas, editor, sidebar, toolbar, console, log, message;
        var $frame, $main, $top, $separator, $bottom, $loading;

        var frame = this;
        var separatorEnabled = true;
        var currentToken = "";
        var currentId = null;

        TComponent.call(this, "TFrame.html", function(component) {
            waiting = ['canvas', 'editor', 'sidebar', 'toolbar', 'console', 'log', 'message'];

            checkWaiting = function(name) {
                var i = waiting.indexOf(name);
                if (i > -1) {
                    waiting.splice(i, 1);
                }
                if (waiting.length === 0) {
                    if (typeof callback !== 'undefined') {
                        callback.call(this, component);
                    }
                }
            };

            $frame = component;
            $main = component.find("#tframe-main");
            $top = component.find("#tframe-top");
            $separator = component.find("#tframe-separator");
            $bottom = component.find("#tframe-bottom");
            $loading = component.find("#tframe-loading");
            var loadingText = $loading.find("p");
            loadingText.text(TEnvironment.getMessage('loading-message'));

            THints.loadHints("hints_create.json");

            canvas = new TCanvas(function(c) {
                component.find("#TCanvas").replaceWith(c);
                checkWaiting("canvas");
            });
            editor = new TEditor(function(c) {
                component.find("#TEditor").replaceWith(c);
                checkWaiting("editor");
            });
            sidebar = new TSidebar(function(c) {
                component.find("#TSidebar").replaceWith(c);
                checkWaiting("sidebar");
            });
            toolbar = new TToolbar(function(c) {
                component.find("#TToolbar").replaceWith(c);
                checkWaiting("toolbar");
            });
            console = new TConsole(function(c) {
                component.find("#TConsole").replaceWith(c);
                checkWaiting("console");
            });
            log = new TLog(function(c) {
                component.find("#TLog").replaceWith(c);
                checkWaiting("log");
            });
            message = new TMessage(function(c) {
                component.find("#TMessage").replaceWith(c);
                checkWaiting("message");
            });

        });

        var checkSeparatorEnabled = function(event) {
            if (!separatorEnabled) {
                event.stopImmediatePropagation();
            }
        };

        this.mounted = function() {
            // Set UI
            TUI.setFrame(frame);
            TUI.setCanvas(canvas);
            TUI.setEditor(editor);
            TUI.setSidebar(sidebar);
            TUI.setToolbar(toolbar);
            TUI.setConsole(console);
            TUI.setLog(log);
            TUI.setMessage(message);

            // Plug Runtime with Log
            TRuntime.setLog(log);

            canvas.mounted();
            editor.mounted();
            sidebar.mounted();
            console.mounted();
            toolbar.mounted();
            log.mounted();
            $main.on("splitpane:resized", function() {
                editor.resize();
            });
            // Important to attach handler before calling splitPane
            $separator.on("mousedown", checkSeparatorEnabled);
            var initEditor = function() {
                $(window).off("resize", initEditor);
                if ($frame.height()>0) {
                    $('.split-pane').splitPane();
                    initialized = true;
                    // init separator position so that toolbar is visible
                    TUI.enableEditor(false);
                    $loading.fadeOut(1000, function() {
                        $(this).remove();
                    });				
                    // set init function to be launched whenever frame parameters (ie access token) change
                    TEnvironment.registerParametersHandler(function (parameters, callback) {
                        var initRequired = false;
                        var idSet = false;
                        for (var name in parameters) {
                            if (name === 'editor') {
                                var editor = (parameters['editor']=='true');
                                if (editor) {
                                    TUI.enableEditor(false);
                                } else {
                                    TUI.disableEditor(false);
                                }
                            }
                            if (name === 'id') {
                                idSet = true;
                                if (currentId != parameters['id']) {
                                    currentId = parameters['id'];
                                    initRequired = true;
                                }
                            }
                            if (name === 'token') {
                                if (currentToken != parameters['token']) {
                                    currentToken = parameters['token'];
                                    initRequired = true;
                                }
                            }
                            if (name === 'wiki') {
                                var wiki = (parameters['wiki']=='true');
                                if (wiki) {
                                    TUI.enableWiki();
                                } else {
                                    TUI.disableWiki();
                                }
                            }
                        }
                        if (!idSet) {
                            if (currentId !== null) {
                                initRequired = true;
                            }
                            currentId = null;
                        }
                        if (initRequired) {
                            TUI.init(currentId);
                        }
                    });
                    TEnvironment.registerMessagesHandler(function(message) {
                        if (message=="init") {
                            TUI.init(currentId);
                        }
                    });
                } else {
                    $(window).resize(initEditor);
                }
            };
            initEditor();
        };

        this.setSeparatorPosition = function (value) {
            $top.css('bottom', value);
            $top.css('color', 'blue');
            $separator.css('bottom', value);
            $bottom.css('height', value);
            $frame.resize();
        };

        this.lowerSeparator = function(value) {
            if (initialized) {
                var totalHeight = $frame.height();
                var currentBottom = totalHeight - ($separator.position().top + $separator.height());
                var newBottom = ((currentBottom - value) * 100 / totalHeight) + '%';
                this.setSeparatorPosition(newBottom);
            }
        };

        this.raiseSeparator = function(value) {
            this.lowerSeparator(-value);
        };

        this.disableSeparator = function() {
            separatorEnabled = false;
            $separator.addClass("disabled");
        };

        this.enableSeparator = function() {
            separatorEnabled = true;
            $separator.removeClass("disabled");
        };

        // Declare global functions

        /*if (typeof window.isUnsaved === 'undefined') {
            window.isUnsaved = function() {
                return TEnvironment.getProject().isUnsaved();
            };
        }*/

    }

    TFrame.prototype = Object.create(TComponent.prototype);
    TFrame.prototype.constructor = TFrame;


    return TFrame;
});
