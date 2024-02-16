require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/PopupTemplate",
  "esri/layers/GraphicsLayer",
  "esri/widgets/DirectLineMeasurement3D",
  "esri/widgets/Sketch",
  "esri/geometry/geometryEngine",
], function (
  Map,
  MapView,
  FeatureLayer,
  PopupTemplate,
  GraphicsLayer,
  DirectLineMeasurement3D,
  Sketch,
  geometryEngine
) {
  let map = new Map({
    basemap: "streets",
  });

  let view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-118.805, 34.027], // longitude, latitude
    zoom: 13,
  });

  // Trails layer
  let trailsLayer = new FeatureLayer({
    url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails/FeatureServer/0",
  });
  map.add(trailsLayer);

  // Parks layer
  let parksLayer = new FeatureLayer({
    url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Parks_and_Open_Space/FeatureServer/0",
    outFields: ["*"],
    popupTemplate: new PopupTemplate({
      title: "{PARK_NAME}",
      content: [
        {
          type: "fields",
          fieldInfos: [
            {
              fieldName: "REPORTED_ACRES",
              label: "Reported Acre",
            },
            {
              fieldName: "HALF_ACRES",
              label: "Half of that area",
              expressionInfos: [
                {
                  name: "halfArea",
                  expression: "$feature.REPORTED_ACRES / 2",
                },
              ],
            },
          ],
        },
      ],
    }),
  });
  map.add(parksLayer);

  // Graphics layer to add drawings
  let graphicsLayer = new GraphicsLayer();
  map.add(graphicsLayer);

  // Add DirectLineMeasurement3D widget
  let measurementWidget = new DirectLineMeasurement3D({
    view: view,
  });
  view.ui.add(measurementWidget, "top-right");

  // Add Sketch widget
  let sketchWidget = new Sketch({
    view: view,
    layer: graphicsLayer,
    creationMode: "update",
    updateOptions: {
      enableRotation: true,
    },
  });
  view.ui.add(sketchWidget, "top-right");

  // Listen to sketch complete event
  sketchWidget.on("create", function (event) {
    if (event.state === "complete") {
      // Calculate the geometry area or length
      let geometry = event.graphic.geometry;
      let area = geometryEngine.geodesicArea(geometry, "square-meters");
      let length = geometryEngine.geodesicLength(geometry, "meters");
      console.log("Area: ", area);
      console.log("Length: ", length);
    }
  });
});
