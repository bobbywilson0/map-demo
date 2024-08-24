let map;

function initializeMap() {
  map = L.map("map", {
    zoomControl: false,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  L.control
    .zoom({
      position: "topright",
    })
    .addTo(map);

  map.fitBounds([
    [24.396308, -125.0],
    [49.384358, -66.93457],
  ]);
}

async function createChoroplethMap() {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json"
    );
    const counties = await response.json();

    const unemployment = await d3.csv(
      "https://raw.githubusercontent.com/plotly/datasets/master/fips-unemp-16.csv"
    );

    const unemploymentById = {};
    unemployment.forEach((d) => {
      unemploymentById[d.fips] = +d.unemp;
    });

    function getColor(d) {
      return d > 10
        ? "#800026"
        : d > 8
        ? "#BD0026"
        : d > 6
        ? "#E31A1C"
        : d > 4
        ? "#FC4E2A"
        : d > 2
        ? "#FD8D3C"
        : d > 0
        ? "#FEB24C"
        : "#FFEDA0";
    }

    L.geoJson(counties, {
      style: function (feature) {
        return {
          fillColor: getColor(unemploymentById[feature.id]),
          weight: 1,
          opacity: 1,
          color: "#404040",
          fillOpacity: 0.7,
        };
      },
      onEachFeature: function (feature, layer) {
        layer.bindPopup(
          "County: " +
            feature.properties.NAME +
            "<br>Unemployment rate: " +
            (unemploymentById[feature.id] || "N/A") +
            "%"
        );
      },
    }).addTo(map);

    const legend = L.control({ position: "bottomright" });
    legend.onAdd = function (map) {
      const div = L.DomUtil.create("div", "info legend");
      const grades = [0, 2, 4, 6, 8, 10];
      const labels = [];

      div.innerHTML += "<h4>Unemployment Rate</h4>";

      for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
          '<i style="background:' +
          getColor(grades[i] + 1) +
          '"></i> ' +
          grades[i] +
          (grades[i + 1] ? "&ndash;" + grades[i + 1] + "%<br>" : "%+");
      }

      return div;
    };
    legend.addTo(map);
  } catch (error) {
    console.error("Error creating choropleth map:", error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initializeMap();
  createChoroplethMap();
});
