var point;

function GetParcelData(evt) {

    if (map.getLevel() < 8) {
        return;
    }


 var identifyTask = new esri.tasks.IdentifyTask('http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Louisville/LOJIC_LandRecords_Louisville/MapServer');
    var identifyParams = new esri.tasks.IdentifyParameters();
    identifyParams.tolerance = 1;
    identifyParams.returnGeometry = true;
    identifyParams.layerIds = [0];
    identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_ALL;
    identifyParams.width = map.width;
    identifyParams.height = map.height;

    map.infoWindow.resize(300, 200);
  

    identifyParams.geometry = evt.mapPoint;
    identifyParams.mapExtent = map.extent;


    var deferred = identifyTask.execute(identifyParams);

    deferred.addCallback(function (response) {
        return dojo.map(response, function (result) {
            var feature = result.feature;
            feature.attributes.layerName = result.layerName;

            var template = new esri.dijit.PopupTemplate({
                title: "Parcel",
                description: "<a href='https://jeffersonpva.ky.gov/property-search/property-listings/?psfldParcelId=" + feature.attributes.PARCELID + "&searchType=ParcelID' target='_blank'>PVA Owner and Value</a>"
            });

            feature.setInfoTemplate(template);

            return feature;
        });
    });



    map.infoWindow.setFeatures([deferred]);
    map.infoWindow.show(evt.mapPoint);
//    $('#modalPVA').modal('show');
   
}

