define(['ui/TComponent', 'jquery', 'TRuntime'], function(TComponent, $, TRuntime) {

    function generateGrid(size) {
        var canvas = document.createElement('canvas');
        canvas.width = size * 2;
        canvas.height = size * 2;
        var painter = canvas.getContext('2d');
        painter.lineWidth = 1;

        // even lines
        painter.beginPath();
        painter.strokeStyle = '#C8DEE5';
        painter.moveTo(0, 0.5);
        painter.lineTo(size * 2, 0.5);
        painter.moveTo(0.5, 0);
        painter.lineTo(0.5, size * 2);
        painter.stroke();

        // odd lines
        painter.beginPath();
        painter.strokeStyle = '#E0E0E0';
        painter.moveTo(1, size + 0.5);
        painter.lineTo(size * 2, size + 0.5);
        painter.moveTo(size + 0.5, 1);
        painter.lineTo(size + 0.5, size * 2);
        painter.stroke();

        return canvas.toDataURL();
    }

    function TLearnCanvas(callback) {
        var $main, $canvas, $canvasLoading, $canvasLoadingValue;

        TComponent.call(this, "TLearnCanvas.html", function(component) {
            $main = component;
            $canvas = component.find("#tcanvas");
            $canvasLoading = component.find("#tcanvas-loading");
            $canvasLoadingValue = component.find("#tcanvas-loading-value");

            if (typeof callback !== 'undefined') {
                callback.call(this, component);
            }
        });

        this.displayed = function() {
            var graphics = TRuntime.getGraphics();
            graphics.setCanvas("tcanvas");
            // resize canvas and its container when window is resized
            $(window).resize(function(e) {
                var width = $main.width();
                var height = $main.height();
                graphics.resize(width, height);
            });
        };

        this.show = function() {
            $main.show();
        };

        this.hide = function() {
            $main.hide();
        };
        this.showLoading = function() {
            $canvasLoading.show();
        };
        this.setLoadingValue = function(count, total) {
            var value = Math.round(count * 100 / total);
            $canvasLoadingValue.text(value + "%");
        };
        this.removeLoading = function() {
            $canvasLoading.hide();
            var grid = generateGrid(32);
            $canvas.css('background', 'url(' + grid + ') repeat');
        };
        this.giveFocus = function() {
            $canvas.get(0).focus();
        };
    }

    TLearnCanvas.prototype = Object.create(TComponent.prototype);
    TLearnCanvas.prototype.constructor = TLearnCanvas;

    return TLearnCanvas;
});
