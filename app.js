// Positium Task Assignment
// Author: Sinoj Kokulasingam
// Date: 29.10.2024
// Description: This is the main script file that contains the ESRI JS SDK code to display the map and the charts.
// The script also contains the functions to fetch data from the OECD API depending on the selected countries.
// Submitting for the intent of applying for the GIS developer role at Positium.

require(["esri/Map",
    "esri/layers/GeoJSONLayer",
    "esri/views/MapView",
    "esri/widgets/Popup",
    "esri/Graphic",
    "esri/symbols/SimpleFillSymbol",
], (
    Map,
    GeoJSONLayer,
    MapView,
    Popup,
    Graphic,
    SimpleFillSymbol,
) => {
    // Since the right side would be empty, I added a description div to fill up the space
    function addDesc() {
        var desc_1 = document.getElementById("desc-1");
        var desc_2 = document.getElementById("desc-2");
        var prompt_text = document.getElementById("prompt-text");
        desc_1.classList.remove("chart-desc-hide");
        desc_2.classList.remove("chart-desc-hide");
        prompt_text.classList.remove("chart-desc-hide");
    };
    // Function to remove the description div
    function removeDesc() {
        var desc_1 = document.getElementById("desc-1");
        var desc_2 = document.getElementById("desc-2");
        var prompt_text = document.getElementById("prompt-text");
        desc_1.classList.add("chart-desc-hide");
        desc_2.classList.add("chart-desc-hide");
        prompt_text.classList.add("chart-desc-hide");
    } 
    // Function to clear previous selections
    function clearSelections() {
        gdpChart.destroy(); // Destroy the bar graph
        hpiChart.destroy(); // Destroy the time series 
        addDesc(); 
        view.graphics.removeAll(); // Clear all graphics from map
        selectedFeatures.length = 0; // Reset selected features array
        selectedAttributes.length = 0; // Reset selected attributes array
        document.getElementById("comparison").innerHTML = ""; // get rid of the emojis
    };
    // I'm using the restcountries API to fetch the flag emojies of the selected countries
    // async function, so that the script can wait for the data to be fetched before adding the emojis
    async function addEmojis(selected_polygons) {
        console.log("Selected polygons:", selected_polygons.codes);
        var country_1 = selected_polygons.codes[0];
        var country_2 = selected_polygons.codes[1];
        const url = `https://restcountries.com/v3.1/alpha?codes=${country_1.toLowerCase()},${country_2.toLowerCase()}`;
        const response = await fetch(url);
        const responsedata = await response.json();
        const country_1_flag = responsedata[0].flag;
        const country_2_flag = responsedata[1].flag;
        var titleDiv = document.getElementById("comparison");
        var content = document.createTextNode(`${country_1_flag} vs ${country_2_flag}`);
        titleDiv.appendChild(content);
    };
    // the data points and labels from the OECD API needed to be redesigned to fit the chart.js format
    // combine labels and data into an array of objects
    function combineLabelsAndData(labels, data) {
        return labels.reduce((obj, label, index) => {
            obj[label] = data[index];
            return obj;
        }, {});
    }
    // I am fetching HPI data from OECD API using the selected polygons as a country parameter
    // async function, so that the script can wait for the data to be fetched before creating the chart
    async function getCountrydata(selected_polygons) {
        var country_1 = selected_polygons.codes[0];
        var country_2 = selected_polygons.codes[1];
        const url = `https://sdmx.oecd.org/public/rest/data/OECD.ECO.MPD,DSD_AN_HOUSE_PRICES@DF_HOUSE_PRICES,1.0/${country_1}+${country_2}.A.RPI.?startPeriod=2014&endPeriod=2024&dimensionAtObservation=TIME_PERIOD`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.sdmx.data+json' // receive JSON data
            }
        });
        const responsedata = await response.json();
        // country 1 data
        var country_1_data = responsedata.data.dataSets[0].series["0:0:0:0"].observations;
        const x_labels = responsedata.data.structures[0].dimensions.observation[0].values.map(item => item.id);
        const country_1_dataPoints = Object.values(country_1_data).map(item => item[0]);
        const country_1_object = combineLabelsAndData(x_labels, country_1_dataPoints);

        // country 2 data
        var country_2_data = responsedata.data.dataSets[0].series["1:0:0:0"].observations;
        const country_2_dataPoints = Object.values(country_2_data).map(item => item[0]);
        const country_2_object = combineLabelsAndData(x_labels, country_2_dataPoints);

        const ctx = document.getElementById('hpiChart').getContext('2d');
        if (hpiChart != null) {
            hpiChart.destroy();
        }
        // create a new line chart canvas
        removeDesc();
        hpiChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Object.keys(country_1_object),
                datasets: [{
                    label: country_1,
                    data: Object.values(country_1_object),
                    borderColor: '#78E0DC',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: country_2,
                    data: Object.values(country_2_object),
                    borderColor: '#A1CDF1',
                    borderWidth: 2,
                    fill: false
                }
                ]
            },
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Year'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'HPI (unitless index)'
                        },
                        beginAtZero: false
                    }
                }
            }
        });
    };
    // create bar chart with GDP data from geojson file
    function createGDPChart(json_data, chart_data, chart_id, chart_title) {
        const ctx = document.getElementById(chart_id).getContext("2d");
        // clear any previous chart instance if it exists
        if (gdpChart != null) {
            gdpChart.destroy();
        }
        // create a new bar chart canvas
        removeDesc();
        gdpChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: json_data.labels,
                datasets: [{
                    label: chart_title,
                    data: chart_data,
                    backgroundColor: ['#78E0DC', '#A1CDF1'],
                    borderColor: ['#78E0DC', '#A1CDF1'],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'GDP per capita (EUR)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Country'
                        }
                    }
                },
                
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    };
    // ESRI JS SDK
    // importing the geojson file
    const baltic_json_url = "baltic.geojson";
    // symbology for the baltic states
    const baltic_renderer = {
        type: "simple",
        symbol: {
            type: "simple-fill",
            color: "#279cd5",
            outline: {
                width: 0.5,
                color: "white"
              }
        }
    };
    // popup template
    const popup_template = {
        title: "Baltic state tool",
        content: "Country: {SOVEREIGNT}; Population: {POP_EST}"
    };
    // creating the geojson layer
    const baltic_states = new GeoJSONLayer({
        url: baltic_json_url,
        popupTemplate: popup_template,
        renderer: baltic_renderer
    });
    // creating the map and view
    const map = new Map({
        basemap: "gray-vector",
        layers: [baltic_states]
    });

    const view = new MapView({
        popup: new Popup({
            dockEnabled: true,
            dockOptions: {
                // Disabling the dock button from the popup so it doesnt interfere with selecting 
                buttonEnabled: false,
                // Ignore the default sizes that trigger responsive docking
                breakpoint: false,
                position: "bottom-right"
            },
            visibleElements: {
                closeButton: false
            }
        }),
        container: "viewDiv",
        center: [25, 57],
        zoom: 5,
        map: map,
    });
    view.popup.highlightEnabled = false; //disabling default popup highlight symbology

    // assigning custom highlight symbology
    const selected_symbology = new SimpleFillSymbol({
        color: [142, 237, 247, 0.7],
        outline: {
            color: '#D496A7',
            width: 1,
        },
    });

    // store and keep track of selected features from map
    const selectedFeatures = [];
    const selectedAttributes = [];

    // initializing chart variables so they can be destroyed later
    var gdpChart = null;
    var hpiChart = null;

    // selecting 2 polygon functionality
    view.on("click", (event) => {
        // checking if already two polygons are selected
        if (selectedFeatures.length >= 2) {
            // if two polygons are already selected, clear the selections
            clearSelections();
            console.log("Only two polygons can be selected at a time.");
            return;
        }
        // hitTest to check which polygon is clicked
        view.hitTest(event).then((response) => {
            if (response.results.length) {
                response.results.forEach((result) => {
                    if (result.graphic && result.graphic.layer) {
                        const featureLayer = result.graphic.layer;
                        // performing query at the clicked location
                        const query = featureLayer.createQuery();
                        query.geometry = event.mapPoint;
                        query.spatialRelationship = "intersects";
                        featureLayer.queryFeatures(query).then((results) => {
                            results.features.forEach((feature) => {
                                // only add a new selection if we have less than 2 selected
                                if (selectedFeatures.length < 2) {
                                    // append attribute data for each selected feature
                                    selectedAttributes.push(feature.attributes);
                                    // Creating a graphic with custom symbology
                                    const selectedGraphic = new Graphic({
                                        geometry: feature.geometry,
                                        symbol: selected_symbology,
                                    });

                                    // Add the selected graphic to the view and update selectedFeatures array
                                    view.graphics.add(selectedGraphic);
                                    selectedFeatures.push(selectedGraphic);

                                }
                            });
                            // Check if we have exactly 2 selected attributes; if so, creating graphs on the right side
                            if (selectedAttributes.length === 2) {
                                // collecting data
                                var selected_polygons = {
                                    codes: [selectedAttributes[0].SOV_A3, selectedAttributes[1].SOV_A3], // country codes
                                    labels: [selectedAttributes[0].SOVEREIGNT, selectedAttributes[1].SOVEREIGNT], // country names
                                    gdp: [selectedAttributes[0].GDP_cap, selectedAttributes[1].GDP_cap] // I manually added GDP data to the geojson file
                                };
                                // calling fns to create charts and adding emojis
                                createGDPChart(selected_polygons, selected_polygons.gdp, "gdpChart", "GDP per capita comparison");
                                getCountrydata(selected_polygons);
                                addEmojis(selected_polygons); //emoji function
                            }
                        });
                    }
                });
            }
        });
    });
});


