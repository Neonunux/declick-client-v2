require.config({
    "baseUrl": 'js/declick',
    paths: {
        "jquery": '../libs/jquery/jquery.min',
        "jquery-ui": '../libs/jquery.ui-1.11.2',
        "quintus": '../libs/quintus-0.2.0/quintus-all.min',
        "acorn": '../libs/acorn/acorn',
        "TObject": 'objects/tobject/TObject',
        "TObject3D": 'objects/tobject3d/TObject3D',
        "TGraphicalObject": 'objects/tgraphicalobject/TGraphicalObject',
        "babylon": '../libs/babylonjs/babylon',
        "TProject": "data/TProject",
        "TProgram": "data/TProgram",
        "TEnvironment": "env/TEnvironment",
        "TLink": "env/TLink",
        "TI18n": "env/TI18n",
        "TInterpreter": "run/TInterpreter",
        "TParser": "run/TParser",
        "TRuntime": "run/TRuntime",
        "TGraphics": "run/TGraphics",
        "TUI": "ui/TUI",
        "CommandManager": "utils/CommandManager",
        "ResourceManager": "utils/ResourceManager",
        "SynchronousManager": "utils/SynchronousManager",
        "TError": "utils/TError",
        "TUtils": "utils/TUtils",
        "TResource": "data/TResource",
        "js-interpreter":"../libs/js-interpreter/interpreter",
        "introjs": "../libs/introjs/intro.min"
    },
    shim: {
        "jquery-ui": {
            exports: "$",
            deps: ['jquery']
        }
    }
});

function load() {
    require(['jquery', 'TEnvironment', 'TRuntime', 'ui/TCanvas', 'TProject', 'TError'], function($, TEnvironment, TRuntime, TCanvas, TProject, TError) {
        window.console.log("*******************");
        window.console.log("* Loading Environment *");
        window.console.log("*******************");
        TEnvironment.load(function() {
            TEnvironment.log("*******************");
            TEnvironment.log("* Loading Runtime *");
            TEnvironment.log("*******************");
            TRuntime.load(function() {
                var canvas = new TCanvas(function(component) {
                    $("body").append(component);
                    $(document).ready(function() {
                        canvas.mounted();
                        // trigger resize in order for canvas to update its size (and remove the 5px bottom margin)
                        $(window).resize();
                        canvas.showLoading();
                        TRuntime.init();
                        var currentProject = new TProject();
                        TEnvironment.registerParametersHandler(function (parameters, callback) {
                            var id = false;
                            var init = false;
                            TRuntime.clear();
                            canvas.clear();
                            for (var name in parameters) {
                                if (name === 'id') {
                                    id = parameters['id'];
                                }
                                if (name === 'init') {
                                    init = decodeURI(parameters['init']);
                                }
                            }
                            if (id !== false && init !== false) {
                                canvas.showLoading();
                                currentProject.init(function() {
                                    TEnvironment.setProject(currentProject);
                                    currentProject.getProgramStatements(init, function(statements) {
                                        if (statements instanceof TError) {
                                            TEnvironment.error(statements.getMessage());
                                        }
                                        currentProject.preloadResources(function(count, total) {
                                                canvas.setLoadingValue(count, total);
                                            }, function() {
                                            canvas.removeLoading();
                                            canvas.giveFocus();
                                            TRuntime.executeStatements(statements, init);
                                        });
                                    });
                                }, id);

                            }
                        });
                    });
                });
            });
        });
    });
}

// TODO: handle loading
var loading = new Image();
loading.src = "images/loader2.gif";
if (loading.complete) {
    load();
} else {
    loading.onload = load();
}


