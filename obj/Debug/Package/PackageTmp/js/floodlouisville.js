var map, rasterLayer;
var canvasSupport;
var stage = 16;

var MinLatitude = 1177944.76220945;
var MaxLatitude = 1231980.76220945;
var MaxLongitude = 293585.310571998;
var MinLongitude = 264401.310571998;

var mapWidthPixels = 9006;
var mapHeightPixels = 4864;


//sample  --  fix min and maxes above
//var MinLatitude = 1205690.68;
//var MaxLatitude = 1219322.68;
//var MinLongitude = 276067.31125;
//var MaxLongitude = 283951.31125;

//var mapWidthPixels = 2272;
//var mapHeightPixels = 1314;

var _hasLevee = false;

var pixelX, pixelY;
var navToolbar, initExtent;
var aerial, graybase;
var timer1 = null;
var kml;
var ALL;

function startMap() {


    require(["esri/map", "bootstrap/src/js/bootstrapmap.js", "esri/tasks/identify", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color", "esri/tasks/IdentifyParameters", "esri/dijit/Popup", "js/RasterLayer.js", "esri/toolbars/navigation", "dojo/domReady!"],
          function (Map, BootstrapMap, all, Popup, SimpleFillSymbol, Color) {
              //does the browser support canvas? 
              canvasSupport = supports_canvas();
              if (!canvasSupport) {
                  $('#modalNoCanvas').modal('show');
              }

//              var lods = [
//                 { "level": 5, "resolution": 16.6666666666667, "scale": 19200 },
//                 { "level": 6, "resolution": 8.33333333333333, "scale": 9600 },
//                 { "level": 7, "resolution": 4.16666666666667, "scale": 4800 },
//                 { "level": 8, "resolution": 2.08333333333333, "scale": 2400 },
//                 { "level": 9, "resolution": 1.04166666666667, "scale": 1200 },
//                 { "level": 10, "resolution": 0.520833333333333, "scale": 600 },
//                 { "level": 11, "resolution": 0.260416666666667, "scale": 300}];


              initExtent = new esri.geometry.Extent(
                {
                    "xmin": 1205151.43088027,
                    "ymin": 276859.077515164,
                    "xmax": 1211849.34754693,
                    "ymax": 280817.410848497,
                    "spatialReference": { "wkid": 2246 }
                });

//              esri.config.defaults.io.proxyUrl = "proxy.ashx";
//              esriConfig.defaults.io.alwaysUseProxy = true;

              var fill = new esri.symbol.SimpleFillSymbol("solid", null, new esri.Color("#A4CE67"));
              var popup = new esri.dijit.Popup({
                  fillSymbol: new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25])),
                  titleInBody: false
              }, dojo.create("div"));

              var CenterPoint = new esri.geometry.Point(1208572.8322, 279493.2877, new esri.SpatialReference({ wkid: 2246 }));
              map = BootstrapMap.create("mapDiv", {
              //    extent: initExtent,
                  center: CenterPoint,
                   zoom:8,
//                  lods: lods,
                   logo: true,
                  scrollWheelZoom: true,
                  infoWindow: popup
              });

              //    dojo.connect(map, "onUpdateStart", function () {
              //        esri.show(dojo.byId("status"));
              //    });
              //    dojo.connect(map, "onUpdateEnd", function () {
              //        esri.hide(dojo.byId("status"));
              //    });





              dojo.connect(map, "onClick", GetParcelData);

              dojo.connect(map, "onLoad", mapLoaded);

              aerial = new esri.layers.ArcGISTiledMapServiceLayer("http://ags2.lojic.org/ArcGIS/rest/services/External/Imagery/MapServer", { minScale: 2400 });
              map.addLayer(aerial);

              graybase = new esri.layers.ArcGISTiledMapServiceLayer("http://ags2.lojic.org/ArcGIS/rest/services/External/StreetMapBasic/MapServer", { maxScale: 4800 });
              map.addLayer(graybase);


              var sr = new esri.SpatialReference({ wkid: 2246 });
              var kmlUrl = 'http://10.floodlouisville.appspot.com/kml/floodwall.kml';
              //var kmlUrl = 'http://floodlouisville.appspot.com/kml/floodwall.kml';
              kml = new esri.layers.KMLLayer(kmlUrl, { id: "lyrLevees", visible: false, outSR: sr });
              map.addLayer(kml);

          });


   


}





function mapLoaded() {

    $('#divSpinner').show();

    if (canvasSupport) {
        navToolbar = new esri.toolbars.Navigation(map);
        MakeRasterLayer();
        var handleExtentChange = dojo.connect(map, "onExtentChange", function (extent) {
            //clearTimeout(timer1);
            //map.removeLayer(rasterLayer);
            //timer1 = setTimeout(function () { MakeRasterLayer() }, 1500);

            var buffer = 5; //in my case, unit is 5 meter
////            // set costraint extent to initExtent +buffer
////            //  var constraintExtent = new esri.geometry.Extent(initExtent.xmin - buffer, initExtent.ymin - buffer, initExtent.xmax + buffer, initExtent.ymax + buffer);
////            var constraintExtent = new esri.geometry.Extent(
////              {
////                  "xmin": 1195095.35066899,
////                  "ymin": 274116.722321375,
////                  "xmax": 1217421.73955788,
////                  "ymax": 287311.166765819,
////                  "spatialReference": { "wkid": 2246 }
////              });
////            if (!constraintExtent.contains(extent) && !constraintExtent.intersects(extent)) {
////                // zoom back to previous extent
////                navToolbar.zoomToPrevExtent();
////                clearTimeout(timer1);
////                map.removeLayer(rasterLayer);
////                MakeRasterLayer();
////                //timer1 = setTimeout(function () { MakeRasterLayer() }, 1500);
////            }
////            else {
////                clearTimeout(timer1);
////                map.removeLayer(rasterLayer);
////                MakeRasterLayer();
////                //timer1 = setTimeout(function () { MakeRasterLayer() }, 1500);
            ////            }
           
            clearTimeout(timer1);
            map.removeLayer(rasterLayer);
            MakeRasterLayer();
        });


    }
  

    //resize the map when the browser resizes
    dojo.connect(map, 'resize', map, function () {
        map.reposition();
        MakeRasterLayer();
    });

}


function MakeRasterLayer() {

    if (rasterLayer != null) {
        map.removeLayer(rasterLayer);
        dojo.create("canvas");
    }
    rasterLayer = null;

    rasterLayer = new modules.RasterLayer(null, {
        opacity: 0.7
    });

    map.addLayer(rasterLayer);
    getRasterData();
}



function getRasterData() {

    rasterLayer.clear();

    var i = new Image();
    i.onload = function () {
        rasterLayer.setData(i);

        setElevation(stage);
        //document.getElementById('elevVal').innerHTML = stage;
        $('#divSpinner').hide();
    };

    var minx, miny, maxx, maxy;
    minx = map.extent.xmin;
    miny = map.extent.ymin;
    maxx = map.extent.xmax;
    maxy = map.extent.ymax;

    var extentText = minx + "," + miny + "," + maxx + "," + maxy;
    var w = map.width;
    var h = map.height;
////    LatLngtoPixel(map.extent.xmin, map.extent.ymax);
////    var topy = pixelX / mapWidthPixels;
////    var leftx = pixelY / mapHeightPixels;

////    LatLngtoPixel(map.extent.xmax, map.extent.ymin);
////    var bottomy = pixelX / mapWidthPixels;
////    var rightx = pixelY / mapHeightPixels;

////    $('#divSpinner').show();

////   
////    if (_hasLevee) {
////        i.src = "http://" + window.location.hostname + "/imagedata?image=NEWLev.png&format=png&crop=" + leftx + "," + topy + "," + rightx + "," + bottomy;
////        kml.setVisibility(true);
////    }
////    else {
////        i.src = "http://" + window.location.hostname + "/imagedata?image=NEWnoLEV.png&format=png&crop=" + leftx + "," + topy + "," + rightx + "," + bottomy;
////        kml.setVisibility(false);
    ////    }

    if (_hasLevee) {
        i.src = "http://gis.lwcky.com/arcgis/rest/services/SampleData/floodLEV/MapServer/export?bbox=" + extentText + "&size=" + w + "," + h + "&transparent=true&format=png&&f=image";
        kml.setVisibility(true);
    }
    else {
        i.src = "http://gis.lwcky.com/arcgis/rest/services/SampleData/floodNoLEV/MapServer/export?bbox=" + extentText + "&size=" + w + "," + h + "&transparent=true&format=png&&f=image";
        kml.setVisibility(false);
    }

}


//function LatLngtoPixel(latitude, longitude) {
//    var calcX = (longitude - MaxLongitude) / (MinLongitude - MaxLongitude) * mapWidthPixels - 1;
//    pixelX = calcX;

//    var calcY = ((latitude - MinLatitude) / (MaxLatitude - MinLatitude)) * mapHeightPixels - 1;
//    pixelY = calcY;
//}


function setElevation(floodlevel) {

    stage = floodlevel;
    var sliderVal = stage;
    document.getElementById('lblLevel').innerHTML = stage; 

    rasterLayer.clear();


    var manipuladors = [
    {
        factor: '14',
        cb: function (r, g, b, a, factor) {
            if (r >= 146) {
                //        if (r == 144 && g == 148 && b == 108) {
                return [146, 150, 110, 255];
            }
            return [0, 0, 0, 0];
        }
    },
{
    factor: '15',
    cb: function (r, g, b, a, factor) {
        if (r >= 144) {
            //        if (r == 144 && g == 148 && b == 108) {
            return [144, 148, 108, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '16',
    cb: function (r, g, b, a, factor) {
        if (r >= 144) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106)) {
            return [142, 146, 106, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '17',
    cb: function (r, g, b, a, factor) {
        if (r >= 140) {
            //  if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104)) {
            return [140, 144, 104, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '18',
    cb: function (r, g, b, a, factor) {
        if (r >= 138) {
            // if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102)) {
            return [138, 142, 102, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '19',
    cb: function (r, g, b, a, factor) {
        if (r >= 136) {
            //  if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100)) {
            return [136, 140, 100, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '20',
    cb: function (r, g, b, a, factor) {
        if (r >= 134) {
            //if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98)) {
            return [134, 138, 98, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '21',
    cb: function (r, g, b, a, factor) {
        if (r >= 132) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98) || (r == 132 && g == 136 && b == 96)) {
            return [132, 136, 96, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '22',
    cb: function (r, g, b, a, factor) {
        if (r >= 130) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98) || (r == 132 && g == 136 && b == 96) || (r == 130 && g == 134 && b == 94)) {
            return [130, 134, 94, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '23',
    cb: function (r, g, b, a, factor) {
        if (r >= 128) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98) || (r == 132 && g == 136 && b == 96) || (r == 130 && g == 134 && b == 94) || (r == 128 && g == 132 && b == 92)) {
            return [128, 132, 92, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '24',
    cb: function (r, g, b, a, factor) {
        if (r >= 126) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98) || (r == 132 && g == 136 && b == 96) || (r == 130 && g == 134 && b == 94) || (r == 128 && g == 132 && b == 92) || (r == 126 && g == 130 && b == 90)) {
            return [126, 130, 90, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '25',
    cb: function (r, g, b, a, factor) {
        if (r >= 124) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98) || (r == 132 && g == 136 && b == 96) || (r == 130 && g == 134 && b == 94) || (r == 128 && g == 132 && b == 92) || (r == 126 && g == 130 && b == 90) || (r == 124 && g == 128 && b == 88)) {
            return [124, 128, 88, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '26',
    cb: function (r, g, b, a, factor) {
        if (r >= 122) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98) || (r == 132 && g == 136 && b == 96) || (r == 130 && g == 134 && b == 94) || (r == 128 && g == 132 && b == 92) || (r == 126 && g == 130 && b == 90) || (r == 124 && g == 128 && b == 88) || (r == 122 && g == 126 && b == 86)) {
            return [122, 126, 86, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '27',
    cb: function (r, g, b, a, factor) {
        if (r >= 120) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98) || (r == 132 && g == 136 && b == 96) || (r == 130 && g == 134 && b == 94) || (r == 128 && g == 132 && b == 92) || (r == 126 && g == 130 && b == 90) || (r == 124 && g == 128 && b == 88) || (r == 122 && g == 126 && b == 86) || (r == 120 && g == 124 && b == 84)) {
            return [120, 124, 84, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '28',
    cb: function (r, g, b, a, factor) {
        if (r >= 118) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98) || (r == 132 && g == 136 && b == 96) || (r == 130 && g == 134 && b == 94) || (r == 128 && g == 132 && b == 92) || (r == 126 && g == 130 && b == 90) || (r == 124 && g == 128 && b == 88) || (r == 122 && g == 126 && b == 86) || (r == 120 && g == 124 && b == 84) || (r == 118 && g == 122 && b == 82)) {
            return [118, 122, 82, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '29',
    cb: function (r, g, b, a, factor) {
        if (r >= 116) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98) || (r == 132 && g == 136 && b == 96) || (r == 130 && g == 134 && b == 94) || (r == 128 && g == 132 && b == 92) || (r == 126 && g == 130 && b == 90) || (r == 124 && g == 128 && b == 88) || (r == 122 && g == 126 && b == 86) || (r == 120 && g == 124 && b == 84) || (r == 118 && g == 122 && b == 82) || (r == 116 && g == 120 && b == 80)) {
            return [116, 120, 80, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '30',
    cb: function (r, g, b, a, factor) {
        if (r >= 114) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98) || (r == 132 && g == 136 && b == 96) || (r == 130 && g == 134 && b == 94) || (r == 128 && g == 132 && b == 92) || (r == 126 && g == 130 && b == 90) || (r == 124 && g == 128 && b == 88) || (r == 122 && g == 126 && b == 86) || (r == 120 && g == 124 && b == 84) || (r == 118 && g == 122 && b == 82) || (r == 116 && g == 120 && b == 80) || (r == 114 && g == 118 && b == 78)) {
            return [114, 118, 78, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '31',
    cb: function (r, g, b, a, factor) {
        if (r >= 112) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98) || (r == 132 && g == 136 && b == 96) || (r == 130 && g == 134 && b == 94) || (r == 128 && g == 132 && b == 92) || (r == 126 && g == 130 && b == 90) || (r == 124 && g == 128 && b == 88) || (r == 122 && g == 126 && b == 86) || (r == 120 && g == 124 && b == 84) || (r == 118 && g == 122 && b == 82) || (r == 116 && g == 120 && b == 80) || (r == 114 && g == 118 && b == 78) || (r == 112 && g == 116 && b == 76)) {
            return [112, 116, 76, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '32',
    cb: function (r, g, b, a, factor) {
        if (r >= 110) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98) || (r == 132 && g == 136 && b == 96) || (r == 130 && g == 134 && b == 94) || (r == 128 && g == 132 && b == 92) || (r == 126 && g == 130 && b == 90) || (r == 124 && g == 128 && b == 88) || (r == 122 && g == 126 && b == 86) || (r == 120 && g == 124 && b == 84) || (r == 118 && g == 122 && b == 82) || (r == 116 && g == 120 && b == 80) || (r == 114 && g == 118 && b == 78) || (r == 112 && g == 116 && b == 76) || (r == 110 && g == 114 && b == 74)) {
            return [110, 114, 74, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '33',
    cb: function (r, g, b, a, factor) {
        if (r >= 108) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98) || (r == 132 && g == 136 && b == 96) || (r == 130 && g == 134 && b == 94) || (r == 128 && g == 132 && b == 92) || (r == 126 && g == 130 && b == 90) || (r == 124 && g == 128 && b == 88) || (r == 122 && g == 126 && b == 86) || (r == 120 && g == 124 && b == 84) || (r == 118 && g == 122 && b == 82) || (r == 116 && g == 120 && b == 80) || (r == 114 && g == 118 && b == 78) || (r == 112 && g == 116 && b == 76) || (r == 110 && g == 114 && b == 74) || (r == 108 && g == 112 && b == 72)) {
            return [108, 112, 72, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '34',
    cb: function (r, g, b, a, factor) {
        if (r >= 106) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98) || (r == 132 && g == 136 && b == 96) || (r == 130 && g == 134 && b == 94) || (r == 128 && g == 132 && b == 92) || (r == 126 && g == 130 && b == 90) || (r == 124 && g == 128 && b == 88) || (r == 122 && g == 126 && b == 86) || (r == 120 && g == 124 && b == 84) || (r == 118 && g == 122 && b == 82) || (r == 116 && g == 120 && b == 80) || (r == 114 && g == 118 && b == 78) || (r == 112 && g == 116 && b == 76) || (r == 110 && g == 114 && b == 74) || (r == 108 && g == 112 && b == 72) || (r == 106 && g == 110 && b == 70)) {
            return [106, 110, 70, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '35',
    cb: function (r, g, b, a, factor) {
        if (r >= 104) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98) || (r == 132 && g == 136 && b == 96) || (r == 130 && g == 134 && b == 94) || (r == 128 && g == 132 && b == 92) || (r == 126 && g == 130 && b == 90) || (r == 124 && g == 128 && b == 88) || (r == 122 && g == 126 && b == 86) || (r == 120 && g == 124 && b == 84) || (r == 118 && g == 122 && b == 82) || (r == 116 && g == 120 && b == 80) || (r == 114 && g == 118 && b == 78) || (r == 112 && g == 116 && b == 76) || (r == 110 && g == 114 && b == 74) || (r == 108 && g == 112 && b == 72) || (r == 106 && g == 110 && b == 70) || (r == 104 && g == 108 && b == 68)) {
            return [104, 108, 68, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '36',
    cb: function (r, g, b, a, factor) {
        if (r >= 102) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98) || (r == 132 && g == 136 && b == 96) || (r == 130 && g == 134 && b == 94) || (r == 128 && g == 132 && b == 92) || (r == 126 && g == 130 && b == 90) || (r == 124 && g == 128 && b == 88) || (r == 122 && g == 126 && b == 86) || (r == 120 && g == 124 && b == 84) || (r == 118 && g == 122 && b == 82) || (r == 116 && g == 120 && b == 80) || (r == 114 && g == 118 && b == 78) || (r == 112 && g == 116 && b == 76) || (r == 110 && g == 114 && b == 74) || (r == 108 && g == 112 && b == 72) || (r == 106 && g == 110 && b == 70) || (r == 104 && g == 108 && b == 68) || (r == 102 && g == 106 && b == 66)) {
            return [102, 106, 66, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '37',
    cb: function (r, g, b, a, factor) {
        if (r >= 100) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98) || (r == 132 && g == 136 && b == 96) || (r == 130 && g == 134 && b == 94) || (r == 128 && g == 132 && b == 92) || (r == 126 && g == 130 && b == 90) || (r == 124 && g == 128 && b == 88) || (r == 122 && g == 126 && b == 86) || (r == 120 && g == 124 && b == 84) || (r == 118 && g == 122 && b == 82) || (r == 116 && g == 120 && b == 80) || (r == 114 && g == 118 && b == 78) || (r == 112 && g == 116 && b == 76) || (r == 110 && g == 114 && b == 74) || (r == 108 && g == 112 && b == 72) || (r == 106 && g == 110 && b == 70) || (r == 104 && g == 108 && b == 68) || (r == 102 && g == 106 && b == 66) || (r == 100 && g == 104 && b == 64)) {
            return [100, 104, 64, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '38',
    cb: function (r, g, b, a, factor) {
        if (r >= 98) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98) || (r == 132 && g == 136 && b == 96) || (r == 130 && g == 134 && b == 94) || (r == 128 && g == 132 && b == 92) || (r == 126 && g == 130 && b == 90) || (r == 124 && g == 128 && b == 88) || (r == 122 && g == 126 && b == 86) || (r == 120 && g == 124 && b == 84) || (r == 118 && g == 122 && b == 82) || (r == 116 && g == 120 && b == 80) || (r == 114 && g == 118 && b == 78) || (r == 112 && g == 116 && b == 76) || (r == 110 && g == 114 && b == 74) || (r == 108 && g == 112 && b == 72) || (r == 106 && g == 110 && b == 70) || (r == 104 && g == 108 && b == 68) || (r == 102 && g == 106 && b == 66) || (r == 100 && g == 104 && b == 64) || (r == 98 && g == 102 && b == 62)) {
            return [98, 102, 62, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '39',
    cb: function (r, g, b, a, factor) {
        if (r >= 96) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98) || (r == 132 && g == 136 && b == 96) || (r == 130 && g == 134 && b == 94) || (r == 128 && g == 132 && b == 92) || (r == 126 && g == 130 && b == 90) || (r == 124 && g == 128 && b == 88) || (r == 122 && g == 126 && b == 86) || (r == 120 && g == 124 && b == 84) || (r == 118 && g == 122 && b == 82) || (r == 116 && g == 120 && b == 80) || (r == 114 && g == 118 && b == 78) || (r == 112 && g == 116 && b == 76) || (r == 110 && g == 114 && b == 74) || (r == 108 && g == 112 && b == 72) || (r == 106 && g == 110 && b == 70) || (r == 104 && g == 108 && b == 68) || (r == 102 && g == 106 && b == 66) || (r == 100 && g == 104 && b == 64) || (r == 98 && g == 102 && b == 62) || (r == 96 && g == 100 && b == 60)) {
            return [96, 100, 60, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '40',
    cb: function (r, g, b, a, factor) {
        if (r >= 94) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98) || (r == 132 && g == 136 && b == 96) || (r == 130 && g == 134 && b == 94) || (r == 128 && g == 132 && b == 92) || (r == 126 && g == 130 && b == 90) || (r == 124 && g == 128 && b == 88) || (r == 122 && g == 126 && b == 86) || (r == 120 && g == 124 && b == 84) || (r == 118 && g == 122 && b == 82) || (r == 116 && g == 120 && b == 80) || (r == 114 && g == 118 && b == 78) || (r == 112 && g == 116 && b == 76) || (r == 110 && g == 114 && b == 74) || (r == 108 && g == 112 && b == 72) || (r == 106 && g == 110 && b == 70) || (r == 104 && g == 108 && b == 68) || (r == 102 && g == 106 && b == 66) || (r == 100 && g == 104 && b == 64) || (r == 98 && g == 102 && b == 62) || (r == 96 && g == 100 && b == 60) || (r == 94 && g == 98 && b == 58)) {
            return [94, 98, 58, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '41',
    cb: function (r, g, b, a, factor) {
        if (r >= 92) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98) || (r == 132 && g == 136 && b == 96) || (r == 130 && g == 134 && b == 94) || (r == 128 && g == 132 && b == 92) || (r == 126 && g == 130 && b == 90) || (r == 124 && g == 128 && b == 88) || (r == 122 && g == 126 && b == 86) || (r == 120 && g == 124 && b == 84) || (r == 118 && g == 122 && b == 82) || (r == 116 && g == 120 && b == 80) || (r == 114 && g == 118 && b == 78) || (r == 112 && g == 116 && b == 76) || (r == 110 && g == 114 && b == 74) || (r == 108 && g == 112 && b == 72) || (r == 106 && g == 110 && b == 70) || (r == 104 && g == 108 && b == 68) || (r == 102 && g == 106 && b == 66) || (r == 100 && g == 104 && b == 64) || (r == 98 && g == 102 && b == 62) || (r == 96 && g == 100 && b == 60) || (r == 94 && g == 98 && b == 58) || (r == 92 && g == 96 && b == 56)) {
            return [92, 96, 56, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '42',
    cb: function (r, g, b, a, factor) {
        if (r >= 90) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98) || (r == 132 && g == 136 && b == 96) || (r == 130 && g == 134 && b == 94) || (r == 128 && g == 132 && b == 92) || (r == 126 && g == 130 && b == 90) || (r == 124 && g == 128 && b == 88) || (r == 122 && g == 126 && b == 86) || (r == 120 && g == 124 && b == 84) || (r == 118 && g == 122 && b == 82) || (r == 116 && g == 120 && b == 80) || (r == 114 && g == 118 && b == 78) || (r == 112 && g == 116 && b == 76) || (r == 110 && g == 114 && b == 74) || (r == 108 && g == 112 && b == 72) || (r == 106 && g == 110 && b == 70) || (r == 104 && g == 108 && b == 68) || (r == 102 && g == 106 && b == 66) || (r == 100 && g == 104 && b == 64) || (r == 98 && g == 102 && b == 62) || (r == 96 && g == 100 && b == 60) || (r == 94 && g == 98 && b == 58) || (r == 92 && g == 96 && b == 56) || (r == 90 && g == 94 && b == 54)) {
            return [90, 94, 54, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '43',
    cb: function (r, g, b, a, factor) {
        if (r >= 88) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98) || (r == 132 && g == 136 && b == 96) || (r == 130 && g == 134 && b == 94) || (r == 128 && g == 132 && b == 92) || (r == 126 && g == 130 && b == 90) || (r == 124 && g == 128 && b == 88) || (r == 122 && g == 126 && b == 86) || (r == 120 && g == 124 && b == 84) || (r == 118 && g == 122 && b == 82) || (r == 116 && g == 120 && b == 80) || (r == 114 && g == 118 && b == 78) || (r == 112 && g == 116 && b == 76) || (r == 110 && g == 114 && b == 74) || (r == 108 && g == 112 && b == 72) || (r == 106 && g == 110 && b == 70) || (r == 104 && g == 108 && b == 68) || (r == 102 && g == 106 && b == 66) || (r == 100 && g == 104 && b == 64) || (r == 98 && g == 102 && b == 62) || (r == 96 && g == 100 && b == 60) || (r == 94 && g == 98 && b == 58) || (r == 92 && g == 96 && b == 56) || (r == 90 && g == 94 && b == 54) || (r == 88 && g == 92 && b == 52)) {
            return [88, 92, 52, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '44',
    cb: function (r, g, b, a, factor) {
        if (r >= 86) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98) || (r == 132 && g == 136 && b == 96) || (r == 130 && g == 134 && b == 94) || (r == 128 && g == 132 && b == 92) || (r == 126 && g == 130 && b == 90) || (r == 124 && g == 128 && b == 88) || (r == 122 && g == 126 && b == 86) || (r == 120 && g == 124 && b == 84) || (r == 118 && g == 122 && b == 82) || (r == 116 && g == 120 && b == 80) || (r == 114 && g == 118 && b == 78) || (r == 112 && g == 116 && b == 76) || (r == 110 && g == 114 && b == 74) || (r == 108 && g == 112 && b == 72) || (r == 106 && g == 110 && b == 70) || (r == 104 && g == 108 && b == 68) || (r == 102 && g == 106 && b == 66) || (r == 100 && g == 104 && b == 64) || (r == 98 && g == 102 && b == 62) || (r == 96 && g == 100 && b == 60) || (r == 94 && g == 98 && b == 58) || (r == 92 && g == 96 && b == 56) || (r == 90 && g == 94 && b == 54) || (r == 88 && g == 92 && b == 52) || (r == 86 && g == 90 && b == 50)) {
            return [86, 90, 50, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '45',
    cb: function (r, g, b, a, factor) {
        if (r >= 84) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98) || (r == 132 && g == 136 && b == 96) || (r == 130 && g == 134 && b == 94) || (r == 128 && g == 132 && b == 92) || (r == 126 && g == 130 && b == 90) || (r == 124 && g == 128 && b == 88) || (r == 122 && g == 126 && b == 86) || (r == 120 && g == 124 && b == 84) || (r == 118 && g == 122 && b == 82) || (r == 116 && g == 120 && b == 80) || (r == 114 && g == 118 && b == 78) || (r == 112 && g == 116 && b == 76) || (r == 110 && g == 114 && b == 74) || (r == 108 && g == 112 && b == 72) || (r == 106 && g == 110 && b == 70) || (r == 104 && g == 108 && b == 68) || (r == 102 && g == 106 && b == 66) || (r == 100 && g == 104 && b == 64) || (r == 98 && g == 102 && b == 62) || (r == 96 && g == 100 && b == 60) || (r == 94 && g == 98 && b == 58) || (r == 92 && g == 96 && b == 56) || (r == 90 && g == 94 && b == 54) || (r == 88 && g == 92 && b == 52) || (r == 86 && g == 90 && b == 50) || (r == 84 && g == 88 && b == 48)) {
            return [84, 88, 48, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '46',
    cb: function (r, g, b, a, factor) {
        if (r >= 82) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98) || (r == 132 && g == 136 && b == 96) || (r == 130 && g == 134 && b == 94) || (r == 128 && g == 132 && b == 92) || (r == 126 && g == 130 && b == 90) || (r == 124 && g == 128 && b == 88) || (r == 122 && g == 126 && b == 86) || (r == 120 && g == 124 && b == 84) || (r == 118 && g == 122 && b == 82) || (r == 116 && g == 120 && b == 80) || (r == 114 && g == 118 && b == 78) || (r == 112 && g == 116 && b == 76) || (r == 110 && g == 114 && b == 74) || (r == 108 && g == 112 && b == 72) || (r == 106 && g == 110 && b == 70) || (r == 104 && g == 108 && b == 68) || (r == 102 && g == 106 && b == 66) || (r == 100 && g == 104 && b == 64) || (r == 98 && g == 102 && b == 62) || (r == 96 && g == 100 && b == 60) || (r == 94 && g == 98 && b == 58) || (r == 92 && g == 96 && b == 56) || (r == 90 && g == 94 && b == 54) || (r == 88 && g == 92 && b == 52) || (r == 86 && g == 90 && b == 50) || (r == 84 && g == 88 && b == 48) || (r == 82 && g == 86 && b == 46)) {
            return [82, 86, 46, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '47',
    cb: function (r, g, b, a, factor) {
        if (r >= 80) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98) || (r == 132 && g == 136 && b == 96) || (r == 130 && g == 134 && b == 94) || (r == 128 && g == 132 && b == 92) || (r == 126 && g == 130 && b == 90) || (r == 124 && g == 128 && b == 88) || (r == 122 && g == 126 && b == 86) || (r == 120 && g == 124 && b == 84) || (r == 118 && g == 122 && b == 82) || (r == 116 && g == 120 && b == 80) || (r == 114 && g == 118 && b == 78) || (r == 112 && g == 116 && b == 76) || (r == 110 && g == 114 && b == 74) || (r == 108 && g == 112 && b == 72) || (r == 106 && g == 110 && b == 70) || (r == 104 && g == 108 && b == 68) || (r == 102 && g == 106 && b == 66) || (r == 100 && g == 104 && b == 64) || (r == 98 && g == 102 && b == 62) || (r == 96 && g == 100 && b == 60) || (r == 94 && g == 98 && b == 58) || (r == 92 && g == 96 && b == 56) || (r == 90 && g == 94 && b == 54) || (r == 88 && g == 92 && b == 52) || (r == 86 && g == 90 && b == 50) || (r == 84 && g == 88 && b == 48) || (r == 82 && g == 86 && b == 46) || (r == 80 && g == 84 && b == 44)) {
            return [80, 84, 44, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '48',
    cb: function (r, g, b, a, factor) {
        if (r >= 78) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98) || (r == 132 && g == 136 && b == 96) || (r == 130 && g == 134 && b == 94) || (r == 128 && g == 132 && b == 92) || (r == 126 && g == 130 && b == 90) || (r == 124 && g == 128 && b == 88) || (r == 122 && g == 126 && b == 86) || (r == 120 && g == 124 && b == 84) || (r == 118 && g == 122 && b == 82) || (r == 116 && g == 120 && b == 80) || (r == 114 && g == 118 && b == 78) || (r == 112 && g == 116 && b == 76) || (r == 110 && g == 114 && b == 74) || (r == 108 && g == 112 && b == 72) || (r == 106 && g == 110 && b == 70) || (r == 104 && g == 108 && b == 68) || (r == 102 && g == 106 && b == 66) || (r == 100 && g == 104 && b == 64) || (r == 98 && g == 102 && b == 62) || (r == 96 && g == 100 && b == 60) || (r == 94 && g == 98 && b == 58) || (r == 92 && g == 96 && b == 56) || (r == 90 && g == 94 && b == 54) || (r == 88 && g == 92 && b == 52) || (r == 86 && g == 90 && b == 50) || (r == 84 && g == 88 && b == 48) || (r == 82 && g == 86 && b == 46) || (r == 80 && g == 84 && b == 44) || (r == 78 && g == 82 && b == 42)) {
            return [78, 82, 42, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '49',
    cb: function (r, g, b, a, factor) {
        if (r >= 76) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98) || (r == 132 && g == 136 && b == 96) || (r == 130 && g == 134 && b == 94) || (r == 128 && g == 132 && b == 92) || (r == 126 && g == 130 && b == 90) || (r == 124 && g == 128 && b == 88) || (r == 122 && g == 126 && b == 86) || (r == 120 && g == 124 && b == 84) || (r == 118 && g == 122 && b == 82) || (r == 116 && g == 120 && b == 80) || (r == 114 && g == 118 && b == 78) || (r == 112 && g == 116 && b == 76) || (r == 110 && g == 114 && b == 74) || (r == 108 && g == 112 && b == 72) || (r == 106 && g == 110 && b == 70) || (r == 104 && g == 108 && b == 68) || (r == 102 && g == 106 && b == 66) || (r == 100 && g == 104 && b == 64) || (r == 98 && g == 102 && b == 62) || (r == 96 && g == 100 && b == 60) || (r == 94 && g == 98 && b == 58) || (r == 92 && g == 96 && b == 56) || (r == 90 && g == 94 && b == 54) || (r == 88 && g == 92 && b == 52) || (r == 86 && g == 90 && b == 50) || (r == 84 && g == 88 && b == 48) || (r == 82 && g == 86 && b == 46) || (r == 80 && g == 84 && b == 44) || (r == 78 && g == 82 && b == 42) || (r == 76 && g == 80 && b == 40)) {
            return [76, 80, 40, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '50',
    cb: function (r, g, b, a, factor) {
        if (r >= 74) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98) || (r == 132 && g == 136 && b == 96) || (r == 130 && g == 134 && b == 94) || (r == 128 && g == 132 && b == 92) || (r == 126 && g == 130 && b == 90) || (r == 124 && g == 128 && b == 88) || (r == 122 && g == 126 && b == 86) || (r == 120 && g == 124 && b == 84) || (r == 118 && g == 122 && b == 82) || (r == 116 && g == 120 && b == 80) || (r == 114 && g == 118 && b == 78) || (r == 112 && g == 116 && b == 76) || (r == 110 && g == 114 && b == 74) || (r == 108 && g == 112 && b == 72) || (r == 106 && g == 110 && b == 70) || (r == 104 && g == 108 && b == 68) || (r == 102 && g == 106 && b == 66) || (r == 100 && g == 104 && b == 64) || (r == 98 && g == 102 && b == 62) || (r == 96 && g == 100 && b == 60) || (r == 94 && g == 98 && b == 58) || (r == 92 && g == 96 && b == 56) || (r == 90 && g == 94 && b == 54) || (r == 88 && g == 92 && b == 52) || (r == 86 && g == 90 && b == 50) || (r == 84 && g == 88 && b == 48) || (r == 82 && g == 86 && b == 46) || (r == 80 && g == 84 && b == 44) || (r == 78 && g == 82 && b == 42) || (r == 76 && g == 80 && b == 40) || (r == 74 && g == 78 && b == 38)) {
            return [74, 78, 38, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '51',
    cb: function (r, g, b, a, factor) {
        if (r >= 72) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98) || (r == 132 && g == 136 && b == 96) || (r == 130 && g == 134 && b == 94) || (r == 128 && g == 132 && b == 92) || (r == 126 && g == 130 && b == 90) || (r == 124 && g == 128 && b == 88) || (r == 122 && g == 126 && b == 86) || (r == 120 && g == 124 && b == 84) || (r == 118 && g == 122 && b == 82) || (r == 116 && g == 120 && b == 80) || (r == 114 && g == 118 && b == 78) || (r == 112 && g == 116 && b == 76) || (r == 110 && g == 114 && b == 74) || (r == 108 && g == 112 && b == 72) || (r == 106 && g == 110 && b == 70) || (r == 104 && g == 108 && b == 68) || (r == 102 && g == 106 && b == 66) || (r == 100 && g == 104 && b == 64) || (r == 98 && g == 102 && b == 62) || (r == 96 && g == 100 && b == 60) || (r == 94 && g == 98 && b == 58) || (r == 92 && g == 96 && b == 56) || (r == 90 && g == 94 && b == 54) || (r == 88 && g == 92 && b == 52) || (r == 86 && g == 90 && b == 50) || (r == 84 && g == 88 && b == 48) || (r == 82 && g == 86 && b == 46) || (r == 80 && g == 84 && b == 44) || (r == 78 && g == 82 && b == 42) || (r == 76 && g == 80 && b == 40) || (r == 74 && g == 78 && b == 38) || (r == 72 && g == 76 && b == 36)) {
            return [72, 76, 36, 255];
        }
        return [0, 0, 0, 0];
    }
},
{
    factor: '52',
    cb: function (r, g, b, a, factor) {
        if (r >= 70) {
            //        if ((r == 144 && g == 148 && b == 108) || (r == 142 && g == 146 && b == 106) || (r == 140 && g == 144 && b == 104) || (r == 138 && g == 142 && b == 102) || (r == 136 && g == 140 && b == 100) || (r == 134 && g == 138 && b == 98) || (r == 132 && g == 136 && b == 96) || (r == 130 && g == 134 && b == 94) || (r == 128 && g == 132 && b == 92) || (r == 126 && g == 130 && b == 90) || (r == 124 && g == 128 && b == 88) || (r == 122 && g == 126 && b == 86) || (r == 120 && g == 124 && b == 84) || (r == 118 && g == 122 && b == 82) || (r == 116 && g == 120 && b == 80) || (r == 114 && g == 118 && b == 78) || (r == 112 && g == 116 && b == 76) || (r == 110 && g == 114 && b == 74) || (r == 108 && g == 112 && b == 72) || (r == 106 && g == 110 && b == 70) || (r == 104 && g == 108 && b == 68) || (r == 102 && g == 106 && b == 66) || (r == 100 && g == 104 && b == 64) || (r == 98 && g == 102 && b == 62) || (r == 96 && g == 100 && b == 60) || (r == 94 && g == 98 && b == 58) || (r == 92 && g == 96 && b == 56) || (r == 90 && g == 94 && b == 54) || (r == 88 && g == 92 && b == 52) || (r == 86 && g == 90 && b == 50) || (r == 84 && g == 88 && b == 48) || (r == 82 && g == 86 && b == 46) || (r == 80 && g == 84 && b == 44) || (r == 78 && g == 82 && b == 42) || (r == 76 && g == 80 && b == 40) || (r == 74 && g == 78 && b == 38) || (r == 72 && g == 76 && b == 36) || (r == 70 && g == 74 && b == 34)) {
            return [70, 74, 34, 255];
        }
        return [0, 0, 0, 0];
    }
},
];
    for (var i = 0; i <= manipuladors.length - 1; i++) {
        if (manipuladors[i].factor == sliderVal) {
            rasterLayer._transform(manipuladors[i].cb, manipuladors[i].factor);
        }
    }
}




function increaseStage() {

    if (stage <= 51) {
        stage = dojo.number.round(document.getElementById('lblLevel').innerHTML) + 1;
    }
    document.getElementById('lblLevel').innerHTML = stage; setElevation(stage)
    $('#sl2').slider('setValue', stage)

}
function decreaseStage() {

    if (stage >= 15) {
        stage = dojo.number.round(document.getElementById('lblLevel').innerHTML) - 1;
    }
    document.getElementById('lblLevel').innerHTML = stage; setElevation(stage)
    $('#sl2').slider('setValue', stage)
}





//does the browser support canvas? 
function supports_canvas() {
    return !!document.createElement('canvas').getContext;
}




function detectBrowser() {
    var useragent = navigator.userAgent;
    var mapdivMap = document.getElementById("map");


    mapdivMap.style.width = '100%';
    mapdivMap.style.height = '100%';

}


function orientationChanged() {


    if (map) {

        map.reposition();
        map.resize();
        detectBrowser();

    }

}







////new
//function toggleSider() {

//    var vis = $('#sidr-right').css('display');
//    if (vis == 'none') {
//        $.sidr('open', 'sidr-right');
//      //  $('#sidr-toggle').attr('src', 'images/right.png');
//    }
//    else {
//        $.sidr('close', 'sidr-right');
//      //  $('#sidr-toggle').attr('src', 'images/left.png');
//    }
//}



function toggleLevee()
{

    if (_hasLevee) {
        _hasLevee = false;
        document.getElementById('btnToggleLevees').innerHTML = "Toggle Flood Protection System ON";
        
       // document.getElementById('imgDam').src = 'images/dam.png'
    }
    else {
        _hasLevee = true;
        document.getElementById('btnToggleLevees').innerHTML = "Toggle Flood Protection System OFF";
       // document.getElementById('imgDam').src = 'images/damWET.png'
    }


    MakeRasterLayer();
}