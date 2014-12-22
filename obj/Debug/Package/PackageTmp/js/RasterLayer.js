dojo.provide("modules.RasterLayer");
var _CanvasImage;


dojo.addOnLoad(function () {

    dojo.declare("modules.RasterLayer", esri.layers.Layer, {

        // Doc: http://docs.dojocampus.org/dojo/declare#chaining
        "-chains-": {
            constructor: "manual"
        },

        constructor: function (data, options) {
            // Manually call superclass constructor with required arguments
            this.inherited(arguments, ["http://some.server.com/path", options]);

            this.data = data;

            this.loaded = true;
            this.onLoad(this);
        },

        /********************
         * Public Properties
         * 
         * data
         * 
         ********************/

        /**********************
         * Internal Properties
         * 
         * _map
         * _element
         * _context
         * _mapWidth
         * _mapHeight
         * _connects
         * 
         **********************/

        /******************************
         * esri.layers.Layer Interface
         ******************************/

        _setMap: function (map, container) {
            this._map = map;

            var element = this._element = dojo.create("canvas", {
                id: 'canvas',
                width: map.width + "px",
                height: map.height + "px",
                style: "position: absolute; left: 0px; top: 0px;"
            }, container);

            if (esri._isDefined(this.opacity)) {
                dojo.style(element, "opacity", this.opacity);
            }

            this._context = element.getContext("2d");
            if (!this._context) {
                console.error("This browser does not support <canvas> elements.");
            }

            this._mapWidth = map.width;
            this._mapHeight = map.height;

            // Event connections
            this._connects = [];
            this._connects.push(dojo.connect(map, "onPan", this, this._panHandler));
            this._connects.push(dojo.connect(map, "onExtentChange", this, this._extentChangeHandler));
            this._connects.push(dojo.connect(map, "onZoomStart", this, this.clear));
            this._connects.push(dojo.connect(this, "onVisibilityChange", this, this._visibilityChangeHandler));
            this._connects.push(dojo.connect(this, "onOpacityChange", this, this._opacityChangeHandler));
            this._connects.push(dojo.connect(this, "onElevationChange", this, this._elevationChangeHandler));

            // Initial rendering
            this._drawRasterData();

            return element;
        },

        _unsetMap: function (map, container) {
            dojo.forEach(this._connects, dojo.disconnect, dojo);
            if (this._element) {
                container.removeChild(this._element);
            }
            this._map = this._element = this._context = this.data = this._connects = null;
        },
        setOpacity: function (o) {
            if (this.opacity != o) {
                this.onOpacityChange(this.opacity = o);
            }
        },
        setElevation: function (el) {
            var curElev = dojo.number.round(el, 0);
            if (this.elevation !== curElev) {
                this.onElevationChange(this.elevation = curElev);
            }
        },
        // TODO
        // Move to esri.layers.Layer API
        onElevationChange: function () { },
        onOpacityChange: function () { },

        /*****************
         * Public Methods
         *****************/

        setData: function (data) {
            this.data = data;

            if (!this._canDraw()) {
                return;
            }

            this.refresh();
        },

        refresh: function () {
            if (!this._canDraw()) {
                return;
            }

            this._drawRasterData();
        },

        clear: function () {
            if (!this._canDraw()) {
                return;
            }

            this._context.clearRect(0, 0, this._mapWidth, this._mapHeight);
        },

        getRange: function () {
            var data = this.data;
            if (!data) {
                return;
            }

            var dataArray = data.data, noDataValue = data.noDataValue[0];

            var i = 0;
            while (dataArray[i++] === noDataValue);

            var maxValue = dataArray[i - 1], minValue = dataArray[i - 1];
            for (; i < dataArray.length; i++) {
                var val = dataArray[i];
                if (val === noDataValue) {
                    continue;
                }

                if (val > maxValue) {
                    maxValue = val;
                }
                if (val < minValue) {
                    minValue = val;
                }
            }

            return { min: minValue, max: maxValue };
        },

        getDatasetRange: function () {
            var data = this.data;
            if (!data) {
                return;
            }

            var rasterProps = data.rasterProperties;
            if (rasterProps) {
                return { min: rasterProps.datasetMin, max: rasterProps.datasetMax };
            }
        },

        /*******************
         * Internal Methods
         *******************/

        _canDraw: function () {
            return (this._map && this._element && this._context) ? true : false;
        },

        _panHandler: function (extent, delta) {
            dojo.style(this._element, { left: delta.x + "px", top: delta.y + "px" });
        },

        _elevationChangeHandler: function (elevation) {
            this.clear();
            this._drawRasterData();
        },

        _extentChangeHandler: function (extent, delta, levelChange, lod) {
            if (!levelChange) {
                dojo.style(this._element, { left: "0px", top: "0px" });
                this.clear();
            }

            this._drawRasterData();
        },

        _drawRasterData: function () {
            if (!this.data) {
                this.clear();
                return;
            }
            
            var map = this._map;
          
            this._CanvasImage(this.data);
        },

        _CanvasImage: function (src) {
            var context = this._context;
            context.drawImage(src, 0, 0, map.width, map.height);
            this.context = context;
            this.image = src;
            var that = this;
            that.original = this._getdata();

        },


        _getdata: function () {
            return this._context.getImageData(0, 0, map.width, map.height);
        },

        _setData: function (data) {
            return this.context.putImageData(data, 0, 0);
        },

        _transform: function (fn, factor) {
            var olddata = this.original;
            var oldpx = olddata.data;
            var newdata = this.context.createImageData(olddata);
            var newpx = newdata.data
            var res = [];
            var len = newpx.length;
            for (var i = 0; i < len; i += 4) {
                res = fn.call(this, oldpx[i], oldpx[i + 1], oldpx[i + 2], oldpx[i + 3], factor, i);
                newpx[i] = res[0]; // r
                newpx[i + 1] = res[1]; // g
                newpx[i + 2] = res[2]; // b
                newpx[i + 3] = res[3]; // a
            }
            this._setData(newdata);
        },

        _getCFForPositiveValues: function (min, max) {
            if (min < 0) {
                min = 0;
            }

            var interval = 255 / (max - min);

            return function (val) {
                return "rgb(" + Math.floor((val - min) * interval) + ", 0, 0)";
            };
        },

        _getCFForNegativeValues: function (min, max) {
            if (max > 0) {
                max = 0;
            }

            var interval = 255 / (max - min);

            return function (val) {
                return "rgb(0, 0, " + Math.floor((val - min) * interval) + ")";
            };
        },

        /****************
         * Miscellaneous
         ****************/


        
    


        _visibilityChangeHandler: function (visible) {
            if (visible) {
                esri.show(this._element);
            }
            else {
                esri.hide(this._element);
            }
        },

        _opacityChangeHandler: function (value) {
            dojo.style(this._element, "opacity", value);
        }
    }); // end of class declaration

}); // end of addOnLoad



dojo.declare("modules.RasterRenderer", null, {
    getColor: function (value) {
        // Implemented by subclasses
        // Returns: color string. rgb(<r>, <g>, <b>) or rgb(<r>, <g>, <b>, <a>)
    }
});

dojo.declare("modules.MyRasterRenderer", modules.RasterRenderer, {
    constructor: function (parameters) {

    },

    getColor: function (value) {

    }

    /*******************
     * Internal Methods
     *******************/
});




