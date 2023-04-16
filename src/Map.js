import React, { useState, useEffect, useRef } from "react";
import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

function Map(props) {
    const {
        hexVisibility,
        speedVisibility,
        showDeaths,
        showInjuries,
        showMinorCrashes,
        years
    } = props

    const [map, setMap] = useState(null);
    const mapContainer = useRef(null);

    const hexColor = "rgb(119, 216, 240)"
    const pointColor = "yellow"
    const pointColorDeath = "red"
    const pointColorInjury = "orange"
    const borderColor = "rgb(53, 53, 53)"
    const bounds = [
        [-86.91808, 39.01706], // Southwest coordinates
        [-86.16725, 39.33937] // Northeast coordinates
    ]
    const speedCmap = ["#d73027", "#fc8d59", "#fee08b", "#d9ef8b", "#91cf60", "#1a9850"]

    useEffect(() => {

        // fix for making mapbox work with react app
        // mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

        /* 
            INITIALIZE MAP
        */
        const initializeMap = ({ setMap, mapContainer }) => {

            const map = new mapboxgl.Map({
                // it will know where to put the map based on the mapContainer ref
                container: mapContainer.current,
                style: 'mapbox://styles/cterbush/clfyfv364003s01o4xuofdpp3',
                // center it over Bloomington
                center: [-86.52702437238956, 39.1656613635316],
                zoom: 12.5,
                worldCopyJump: true,
                // prevent panning/zooming too far away from Bloomington
                maxBounds: bounds
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

                let firstSymbolId = 'road-label';

                /*
                    ADD DATA SOURCES
                */
                // crash data points 
                map.addSource('crash-data-source', {
                    'type': 'vector',
                    url: 'mapbox://cterbush.asrfcark'
                })
                // hexbins geojson tileset
                map.addSource('hexbin-data-small', {
                    'type': 'vector',
                    url: 'mapbox://cterbush.3c2zgy5z',
                })
                // speed limits
                map.addSource('speed-limits', {
                    'type': 'vector',
                    url: 'mapbox://cterbush.5608sxsh'
                })


                /*
                    ADD LAYERS + STYLING
                */

                map.addLayer({
                    id: 'hex-small',
                    type: 'fill',
                    source: 'hexbin-data-small',
                    'source-layer': 'hexagon-data-small-21dqvs',
                    'layout': {
                        'visibility': 'none'
                    },
                    'paint': {
                        'fill-color': hexColor,
                        'fill-opacity': [
                            'step',
                            ['get', 'n'],
                            .1,
                            100, .3,
                            500, .5,
                            1000, .7,
                        ]
                    },
                }, firstSymbolId).addLayer({
                    // light border on each hexbin
                    'id': 'hex-borders-small',
                    'type': 'line',
                    minzoom: 15,
                    'source': 'hexbin-data-small',
                    'source-layer': 'hexagon-data-small-21dqvs',
                    'layout': {
                        'visibility': 'none'
                    },
                    'paint': {
                        'line-color': borderColor,
                        'line-width': [
                            'case',
                            ['boolean', ['feature-state', 'hover'], false],
                            ['match', ['get', 'density'], 0, 0, 4],
                            ['match', ['get', 'density'], 0, 0, 1]
                        ]

                    }
                }, firstSymbolId)

                // speed limits
                map.addLayer({
                    'id': 'speed-limit-lines',
                    'type': 'line',
                    'source': 'speed-limits',
                    'source-layer': 'speed-limits-7bpvb8',
                    'layout': {
                        visibility: 'visible',
                    },
                    // 'maxzoom': 15,
                    'paint': {
                        'line-color': {
                            property: 'speedlimit',
                            stops: [
                                [0, speedCmap[5]],
                                [15, speedCmap[4]],
                                [20, speedCmap[3]],
                                [30, speedCmap[2]],
                                [40, speedCmap[1]],
                                [55, speedCmap[0]],
                            ]
                        },
                        'line-width': ['interpolate', ['linear'], ['zoom'],
                            // at zoom level 10 => .5px
                            10, 1,
                            // at zoom level 12
                            12, 1,
                            14, 2,
                            // at zoom level 20
                            20, 15
                        ],
                        'line-opacity': .5
                    }
                }, firstSymbolId)

                const point_radius = ['interpolate', ['linear'], ['zoom'],
                    // at zoom level 10 => 1 px
                    10, 1,
                    // at zoom level 12 => 1.5 px
                    12, 1.5,
                    14, 3,
                    // at zoom level 20 => 20 px
                    20, 20
                ]
                map.addLayer({
                    id: 'points-injuries',
                    type: 'circle',
                    source: 'crash-data-source',
                    'source-layer': 'master_injuriesmin',
                    layout: {
                        visibility: 'visible',
                    },
                    paint: {
                        'circle-color': pointColorInjury,
                        'circle-radius': point_radius,
                        // no stroke
                        'circle-stroke-width': 0,
                        'circle-opacity': .8
                    },
                }, firstSymbolId)

                map.addLayer({
                    id: 'points-minor',
                    type: 'circle',
                    source: 'crash-data-source',
                    'source-layer': 'master_minormin',
                    layout: {
                        visibility: 'visible',
                    },
                    paint: {
                        'circle-color': pointColor,
                        'circle-radius': point_radius,
                        // no stroke
                        'circle-stroke-width': 0,
                        'circle-opacity': .3
                    },
                }, firstSymbolId)

                // individual crash data points
                map.addLayer({
                    id: 'points-death',
                    type: 'circle',
                    source: 'crash-data-source',
                    'source-layer': 'master_deathsmin',
                    layout: {
                        visibility: 'visible',
                    },
                    paint: {
                        'circle-color': pointColorDeath,
                        'circle-radius': ['interpolate', ['linear'], ['zoom'],
                            // at zoom level 10 => 1 px
                            10, 1.5,
                            // at zoom level 12 => 1.5 px
                            12, 3,
                            14, 6,
                            // at zoom level 20 => 20 px
                            20, 40
                        ],
                        // no stroke
                        'circle-stroke-width': 0,
                        'circle-opacity': 1
                    },
                }, firstSymbolId)



            })
        }

        if (!map) initializeMap({ setMap, mapContainer });

    }, [bounds, map, speedCmap]);


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

            const popupFunction = (e, layer_name) => {
                // Change the cursor style as a UI indicator.
                map.getCanvas().style.cursor = 'pointer';

                // Copy coordinates array.
                const coordinates = e.features[0].geometry.coordinates.slice()
                const primaryFactor = e.features[0].properties.p
                const date = e.features[0].properties.d
                let deaths = 0
                let injuries = 0
                if (layer_name == 'points-minor') {
                    deaths = e.features[0].properties.n
                    injuries = 0
                } else {
                    deaths = e.features[0].properties.a
                    injuries = e.features[0].properties.n
                }
                const mannerOfCollision = e.features[0].properties.m

                // Ensure that if the map is zoomed out such that multiple
                // copies of the feature are visible, the popup appears
                // over the copy being pointed to.
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                let popupHTML = `
                                <p style=margin-bottom:0;><strong>${new Date(date).toLocaleDateString('en-us', { hour: "numeric", year: "numeric", month: "short", day: "numeric" })}</strong></p>
                                <p style=margin-bottom:0;><strong>Primary factor:</strong> ${primaryFactor ? primaryFactor.charAt(0).toUpperCase() + primaryFactor.slice(1).toLowerCase() : 'Not listed'}</p>
                                <p style=margin-bottom:0;><strong>Type of collision:</strong> ${mannerOfCollision ? mannerOfCollision.charAt(0).toUpperCase() + mannerOfCollision.slice(1).toLowerCase() : 'Not listed'}</p>
                                <div style="display: flex; justify-content: space-between;">
                                <p style=margin-bottom:0;><strong>Deaths:</strong> ${deaths ? deaths : '0'}</p>
                                <p style=margin-bottom:0;><strong>Injuries:</strong> ${injuries ? injuries : '0'}</p>
                                </div>
                            `

                // Populate the popup and set its coordinates
                // based on the feature found.
                popup.setLngLat(coordinates).setHTML(popupHTML).addTo(map);
            }

            // display the popup when a point is hovered over
            map.on('mouseenter', 'points-death', (e) => popupFunction(e, 'points-death'))
            map.on('mouseenter', 'points-injuries', (e) => popupFunction(e, 'points-injuries'))
            map.on('mouseenter', 'points-minor', (e) => popupFunction(e, 'points-minor'))

            const popupRemove = () => {
                map.getCanvas().style.cursor = '';
                popup.remove();
            }

            // hide the popup when the point is no longer hovered
            map.on('mouseleave', 'points-death', popupRemove)
            map.on('mouseleave', 'points-injuries', popupRemove)
            map.on('mouseleave', 'points-minor', popupRemove)

            // hover effect => council districts
            // let hoverId = null;

            // })
            // map.on('mousemove', 'speed-limit-lines', (e) => {
            //     console.log(e.features[0].properties)
            //     // if (hoverId) {
            //     //     map.removeFeatureState({
            //     //         source: 'hexbin-data-small',
            //     //         sourceLayer: 'hexagon-data-small-21dqvs',
            //     //         id: hoverId
            //     //     })
            //     // }

            //     // hoverId = e.features[0].id

            //     // map.setFeatureState(
            //     //     {
            //     //         source: 'hexbin-data-small',
            //     //         sourceLayer: 'hexagon-data-small-21dqvs',
            //     //         id: hoverId
            //     //     },
            //     //     {
            //     //         hover: true
            //     //     }
            //     // )

            // })
        }

    }, [map])

    useEffect(() => {
        if (map) {
            map.setLayoutProperty('hex-small', 'visibility', hexVisibility ? 'visible' : 'none');
            map.setLayoutProperty('hex-borders-small', 'visibility', hexVisibility ? 'visible' : 'none');
        }

    }, [hexVisibility, map])

    useEffect(() => {
        if (map) {
            map.setLayoutProperty('speed-limit-lines', 'visibility', speedVisibility ? 'visible' : 'none');
        }

    }, [speedVisibility, map])

    useEffect(() => {
        if (map) {
            // add year filtering on top of color filtering
            let yearFilter = []
            // for each year in filter, add this array to the filter array
            years.forEach((year) => {
                yearFilter.push(['in', year.toString(), ['get', 'd']])
            })

            if (yearFilter.length > 0) {
                map.setFilter('points-death', ['any', ...yearFilter])
                map.setFilter('points-injuries', ['any', ...yearFilter])
                map.setFilter('points-minor', ['any', ...yearFilter])
            } else {
                map.setFilter('points-death', null)
                map.setFilter('points-injuries', null)
                map.setFilter('points-minor', null)
            }
        }
    }, [years, map])

    useEffect(() => {
        if (map) {
            map.setLayoutProperty('points-death', 'visibility', showDeaths ? 'visible' : 'none')
        }
    }, [showDeaths, map])

    useEffect(() => {
        if (map) {
            map.setLayoutProperty('points-minor', 'visibility', showMinorCrashes ? 'visible' : 'none');
        }
    }, [showMinorCrashes, map])

    useEffect(() => {
        if (map) {
            map.setLayoutProperty('points-injuries', 'visibility', showInjuries ? 'visible' : 'none');
        }
    }, [showInjuries, map])


    return (
        <div ref={mapContainer} className="mapContainer" />
    )
}


export default Map