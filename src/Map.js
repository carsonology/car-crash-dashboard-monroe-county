import React, { useState, useEffect, useRef } from "react";
import mapboxgl from 'mapbox-gl';
// import districts from './data/city-council-districts.geojson'
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

function Map(props) {
    const {
        data,
        hexVisibility,
        // districtVisibility,
        hexGridData,
        showDeaths,
        showInjuries,
        showMinorCrashes,
        years
    } = props

    // console.log(hexGridData)

    const [map, setMap] = useState(null);
    const mapContainer = useRef(null);

    // const districtColor = "rgba(255,255,255,0.2)"
    const hexColor = "rgb(119, 216, 240)"
    const pointColor = "yellow"
    const pointColorDeath = "orange"
    const pointColorInjury = "red"
    const borderColor = "rgb(53, 53, 53)"
    // const borderColor = "rgb(168, 152, 152)"
    const labelColor = "rgb(120,120,120)"

    useEffect(() => {

        /* 
            INITIALIZE MAP
        */
        const initializeMap = ({ setMap, mapContainer }) => {
            const map = new mapboxgl.Map({
                // it will know where to put the map based on the mapContainer ref
                container: mapContainer.current,
                // style: "mapbox://styles/mapbox/dark-v10",
                style: "mapbox://styles/cterbush/clfyfv364003s01o4xuofdpp3",
                // center it over Bloomington
                center: [-86.52702437238956, 39.1656613635316],
                zoom: 12,
                // prevent from zooming out too far
                minZoom: 10
            }).addControl(
                // add geocoder to enable search
                new MapboxGeocoder({
                    accessToken: mapboxgl.accessToken,
                    mapboxgl: mapboxgl
                })
            )

            map.on("load", () => {
                setMap(map)
                map.resize()

                /*
                    ADD DATA SOURCES
                */
                // crash data points 
                map.addSource('crash-data-source', {
                    'type': 'geojson',
                    'data': data
                })
                // city council district areas 
                // map.addSource('council-districts', {
                //     'type': 'geojson',
                //     'data': districts
                // })
                // hexbins geojson (generated in MapContext)
                map.addSource('hexbin-data', {
                    'type': 'geojson',
                    'data': hexGridData
                })

                /*
                    ADD LAYERS + STYLING
                */

                // hexbins
                map.addLayer({
                    id: 'hexBins',
                    type: 'fill',
                    source: 'hexbin-data',
                    // set visibility as visible initially
                    // then it can be toggled later 
                    'layout': {
                        'visibility': 'visible'
                    },
                    'paint': {
                        'fill-color': hexColor,
                        'fill-opacity': [
                            "interpolate", ["linear"], ["get", "a"],
                            // if there are zero points, max opacity = 0
                            0, 0,
                            // if the density = 1, max opacity = 80%
                            1, .8
                        ]
                    }
                }).addLayer({
                    // light border on each hexbin
                    'id': 'hex-borders',
                    'type': 'line',
                    'source': 'hexbin-data',
                    'layout': {},
                    'paint': {
                        'line-color': borderColor,
                        // 'line-width': ['match', ['get', 'density'], 0, 0, 1]
                        'line-width': [
                            'case',
                            ['boolean', ['feature-state', 'hover'], false],
                            ['match', ['get', 'density'], 0, 0, 4],
                            ['match', ['get', 'density'], 0, 0, 1]
                        ]

                    }
                })

                // individual crash data points
                map.addLayer({
                    id: 'points',
                    type: 'circle',
                    source: 'crash-data-source',
                    paint: {
                        'circle-color': ["case",
                            ['has', 'a'],
                            pointColorInjury,
                            ["has", "n"],
                            pointColorDeath,
                            pointColor],
                        // adjust circle radius based on zoom level
                        'circle-radius': ['interpolate', ['linear'], ['zoom'],
                            10, [
                                'case',
                                ['boolean', ['has', 'a'], false],
                                2,
                                1
                            ],
                            // at zoom level 12 => 1.5 px
                            12, [
                                'case',
                                ['boolean', ['has', 'a'], false],
                                3,
                                1.5
                            ],
                            14, [
                                'case',
                                ['boolean', ['has', 'a'], false],
                                6,
                                3
                            ],
                            // at zoom level 20 => 20 px
                            20, [
                                'case',
                                ['boolean', ['has', 'a'], false],
                                40,
                                20
                            ]

                            // // at zoom level 10 => 1 px
                            // 10, .75,
                            // // at zoom level 12 => 1.5 px
                            // 12, 1,
                            // 14, 2,
                            // // at zoom level 20 => 20 px
                            // 20, 20
                        ],
                        // no stroke
                        'circle-stroke-width': 0,
                        'circle-opacity': [
                            'case',
                            ['boolean', ['has', 'n'], true],
                            .8,
                            ['boolean', ['has', 'n'], false],
                            1,
                            .3
                        ],
                        // filter: ['has', 'n']
                    },
                    cluster: true,
                    clusterMaxZoom: 14, // Max zoom to cluster points on
                    clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
                })



            })
        }

        if (!map) initializeMap({ setMap, mapContainer });

    }, [data, hexGridData]);


    /*
        POPUPS & HOVER EFFECTS
    */
    useEffect(() => {

        if (map) {
            // Create a popup, but don't add it to the map yet.
            const popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false,
                className: 'popup'
            })

            // display the popup when a point is hovered over
            map.on('mouseenter', 'points', (e) => {
                // Change the cursor style as a UI indicator.
                map.getCanvas().style.cursor = 'pointer';

                // Copy coordinates array.
                const coordinates = e.features[0].geometry.coordinates.slice()
                const primaryFactor = e.features[0].properties.p
                const date = e.features[0].properties.d
                const deaths = e.features[0].properties.a
                const injuries = e.features[0].properties.n
                const road1 = e.features[0].properties.r
                const road2 = e.features[0].properties.i

                // Ensure that if the map is zoomed out such that multiple
                // copies of the feature are visible, the popup appears
                // over the copy being pointed to.
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                console.log(e.features[0].properties)

                let popupHTML = `
                            <p style=margin-bottom:0;><strong>${new Date(date).toLocaleDateString('en-us', { hour: "numeric", year: "numeric", month: "short", day: "numeric" })}</strong></p>
                            <p style=margin-bottom:0;><strong>Primary factor:</strong> ${primaryFactor ? primaryFactor.charAt(0).toUpperCase() + primaryFactor.slice(1).toLowerCase() : 'Not listed'}</p>
                            <div style="display: flex; justify-content: space-between;">
                            <p style=margin-bottom:0;><strong>Deaths:</strong> ${deaths ? deaths : '0'}</p>
                            <p style=margin-bottom:0;><strong>Injuries:</strong> ${injuries ? injuries : '0'}</p>
                            </div>
                        `
                // <p style=margin-bottom:0;><strong>${road1}${road2 ? ' and ' + road2.charAt(0).toUpperCase() + road2.slice(1).toLowerCase() : ''}</strong></p>

                // Populate the popup and set its coordinates
                // based on the feature found.
                popup.setLngLat(coordinates).setHTML(popupHTML).addTo(map);
            })

            // hide the popup when the point is no longer hovered
            map.on('mouseleave', 'points', () => {
                map.getCanvas().style.cursor = '';
                popup.remove();
            })

            // hover effect => council districts
            let hoverId = null;

            map.on('mousemove', 'hexBins', (e) => {
                if (hoverId) {
                    map.removeFeatureState({
                        source: 'hexbin-data',
                        id: hoverId
                    })
                }

                hoverId = e.features[0].id

                map.setFeatureState(
                    {
                        source: 'hexbin-data',
                        id: hoverId
                    },
                    {
                        hover: true
                    }
                )

            })
        }

    }, [map])

    useEffect(() => {
        if (map) {
            map.setLayoutProperty('hexBins', 'visibility', hexVisibility ? 'visible' : 'none');
            map.setLayoutProperty('hex-borders', 'visibility', hexVisibility ? 'visible' : 'none');

            console.log('hexbins', map.style._layers.hexBins.visibility)
        }

    }, [hexVisibility])

    useEffect(() => {
        // console.log(years)
        if (map) {

            let fullFilter = []

            if (showDeaths && showInjuries && showMinorCrashes) {
                // show all colors
                fullFilter = ['any', ['has', 'a'], ['!', ['has', 'a']]]
            }
            if (showDeaths && !showInjuries && !showMinorCrashes) {
                // show deahts only
                fullFilter = ['has', 'a']
            } else if (showInjuries && !showDeaths && !showMinorCrashes) {
                // show injuries only
                fullFilter = ['has', 'n']
            } else if (showMinorCrashes && !showDeaths && !showInjuries) {
                // show crashes with no injuries or deaths only
                fullFilter = ['all', ["!", ["has", "a"]], ["!", ["has", "n"]]]
            } else if (!showDeaths && showInjuries && showMinorCrashes) {
                // hide deaths only
                fullFilter = ['!', ['has', 'a']]
            } else if (!showInjuries && showDeaths && showMinorCrashes) {
                // hide injuries only
                fullFilter = ['!', ['has', 'n']]
            } else if (!showMinorCrashes && showInjuries && showDeaths) {
                // hide minor crashes only
                fullFilter = ['any', ["has", "a"], ["has", "n"]]
            } else if (!showDeaths && !showInjuries && !showMinorCrashes) {
                // hide all
                fullFilter = ['all', ["has", "a"], ["!", ["has", "a"]]]
            }

            // add year filtering on top of color filtering
            let yearFilter = []
            // for each year in filter, add this array to the filter array
            years.forEach((year) => {
                yearFilter.push(['in', year.toString(), ['get', 'd']])
            })
            if (yearFilter.length < 20) {
                fullFilter = ['all', fullFilter, ['any', ...yearFilter]]
            }

            map.setFilter('points', fullFilter)
        }
    }, [years, showDeaths, showInjuries, showMinorCrashes])


    return (
        <div ref={mapContainer} className="mapContainer" />
    )
}


export default Map


// 10, [
//     'case',
//     ['boolean', ['has', 'n'], false],
//     1.5,
//     1
// ],
// // at zoom level 12 => 1.5 px
// 12, [
//     'case',
//     ['boolean', ['has', 'n'], false],
//     2.25,
//     1.5
// ],
// 14, [
//     'case',
//     ['boolean', ['has', 'n'], false],
//     4.5,
//     3
// ],
// // at zoom level 20 => 20 px
// 20, [
//     'case',
//     ['boolean', ['has', 'n'], false],
//     30,
//     20
// ]