import React, { useState, useEffect, useRef } from "react";
import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

function Map(props) {
    const {
        hexVisibility,
        speedVisibility,
        showDeaths,
        showInjuries,
        showMinorCrashes,
        years
    } = props

    // used to render the map
    const [map, setMap] = useState(null);
    const mapContainer = useRef(null);

    const hexColor = "rgb(119, 216, 240)" // base color for heatmap
    const pointColor = "yellow" // non-fatal crash color
    const pointColorDeath = "red" // fatal crash color
    const pointColorInjury = "orange" // injury-only crash color
    const borderColor = "rgb(53, 53, 53)" // heatmap border color
    const bounds = [ // prevent panning too far from Bloomington
        [-86.91808, 39.01706], // Southwest coordinates
        [-86.16725, 39.33937] // Northeast coordinates
    ]
    // colormap for speed limit lines
    const speedCmap = ["#d7191c", "#fdae61", "#ffffbf", "#a6d96a", "#1a9641"]

    useEffect(() => {

        // fix for making mapbox work with react app
        // uncomment for deployment:
        // mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

        /* 
            INITIALIZE MAP
        */
        const initializeMap = ({ setMap, mapContainer }) => {

            // instantiate the map
            const map = new mapboxgl.Map({
                container: mapContainer.current, // it will know where to put the map based on the mapContainer ref
                style: 'mapbox://styles/cterbush/clfyfv364003s01o4xuofdpp3',
                center: [-86.52702437238956, 39.1656613635316], // center it over Bloomington
                zoom: 12.5, // default zoom
                worldCopyJump: true, // fix for react
                maxBounds: bounds // prevent panning/zooming too far away from Bloomington
            }).addControl( // add geocoder to enable search
                new MapboxGeocoder({
                    accessToken: mapboxgl.accessToken,
                    mapboxgl: mapboxgl,
                    collapsed: true
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

                const labelLayer = 'road-label' // id of label layer, to make sure this is still above all layers rendered below

                /*
                    ADD LAYERS + STYLING
                */
                map.addLayer({ // heatmap
                    id: 'hex-small',
                    type: 'fill',
                    source: 'hexbin-data-small',
                    'source-layer': 'hexagon-data-small-21dqvs',
                    'layout': {
                        'visibility': 'none' // hide on first render
                    },
                    'paint': {
                        'fill-color': hexColor,
                        'fill-opacity': [
                            'step',
                            ['get', 'n'], // 'n' property == number of crashes in each hexagon
                            .1, // < 100 points => 10% opacity
                            100, .3, // 100 - 500 points => 30% opacity
                            500, .5, // 500-1000 points => 50% opacity
                            1000, .7, // > 1000 points => 70% opacity
                        ]
                    },
                }, labelLayer) // insert this layer below the label layer
                    .addLayer({ // light border on each hexbin
                        'id': 'hex-borders-small',
                        'type': 'line',
                        'source': 'hexbin-data-small',
                        'source-layer': 'hexagon-data-small-21dqvs',
                        'layout': {
                            'visibility': 'none' // hide initially
                        },
                        'paint': {
                            'line-color': borderColor,
                            'line-width': 1
                        }
                    }, labelLayer) // add it below the label layer

                map.addLayer({ // speed limits
                    'id': 'speed-limit-lines',
                    'type': 'line',
                    'source': 'speed-limits',
                    'source-layer': 'speed-limits-7bpvb8',
                    'layout': {
                        visibility: 'visible', // show initially
                    },
                    'paint': {
                        'line-color': {
                            property: 's', // 's' property == speed limit
                            stops: [
                                // set colors based on the cmap defined above
                                [16, speedCmap[4]], // speed limit <= 16
                                [20, speedCmap[3]], // speed limit 20, 25
                                [30, speedCmap[2]], // speed limit 30, 35
                                [40, speedCmap[1]], // speed limit 40, 45
                                [55, speedCmap[0]], // speed limit 55 or above
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
                }, labelLayer) // below label layer

                // set up point radius based on zoom for each of the point layers below
                const point_radius = ['interpolate', ['linear'], ['zoom'],
                    // at zoom level 10 => 1 px
                    10, 1,
                    // at zoom level 12 => 1.5 px
                    12, 1.5,
                    14, 3,
                    // at zoom level 20 => 20 px
                    20, 20
                ]

                map.addLayer({ // crashes with no injuries or deaths
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
                }, labelLayer) // below label layer

                map.addLayer({ // crashes with injuries only
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
                }, labelLayer)

                map.addLayer({ // fatal crashes
                    id: 'points-death',
                    type: 'circle',
                    source: 'crash-data-source',
                    'source-layer': 'master_deathsmin',
                    layout: {
                        visibility: 'visible',
                    },
                    paint: {
                        'circle-color': pointColorDeath,
                        // make deaths 1.5x bigger so they're more visible
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
                }, labelLayer)



            })
        }

        // if the map hasn't rendered yet, render it
        if (!map) initializeMap({ setMap, mapContainer });

    }, [bounds, map, speedCmap]);


    /*
        POPUPS & HOVER EFFECTS
    */
    useEffect(() => {

        if (map) { // once the map has rendered
            // Create a popup, but don't add it to the map yet.
            const popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false,
                className: 'popup'
            })

            // function to show the pop up on each points layer
            const popupFunction = (e, layer_name) => {
                map.getCanvas().style.cursor = 'pointer' // change cursor when hovering

                const hoveredPoint = e.features[0]

                const coordinates = hoveredPoint.geometry.coordinates.slice() // get coords
                const primaryFactor = hoveredPoint.properties.p // get primary factor
                const date = hoveredPoint.properties.d // get date
                let deaths = 0
                let injuries = 0
                // the minified geojsons encoded some fields differently, 
                // so the if/else statement makes sure it shows the proper things
                if (layer_name == 'points-minor') {
                    // in the non-fatal crash geojson, we already know there are no 
                    // deaths or injuries since it's pre-filtered, so keep them as zero
                    deaths = 0
                    injuries = 0
                } else {
                    // 'a' field == number of deaths
                    deaths = hoveredPoint.properties.a
                    // 'n' field == number of injuries
                    injuries = hoveredPoint.properties.n
                }
                const mannerOfCollision = hoveredPoint.properties.m

                // Ensure that if the map is zoomed out such that multiple
                // copies of the feature are visible, the popup appears
                // over the copy being pointed to.
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                // create popup contents based on the data extracted above
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

            const popupRemove = () => {
                map.getCanvas().style.cursor = '';
                popup.remove();
            }

            // apply popup function to all points layers
            const pointLayers = ['points-death', 'points-injuries', 'points-minor']
            pointLayers.map((id) => {
                map.on('mouseenter', id, (e) => popupFunction(e, id))
                map.on('mouseleave', id, popupRemove)
            })

            // double check speed color mapping
            // map.on('mousemove', 'speed-limit-lines', (e) => {
            //     console.log(e.features[0].properties)
            // })

        }

    }, [map])

    useEffect(() => { // hide/show heatmap
        if (map) { // if map is rendered
            // set visibility property based on hex visibility state variable passed from App.js
            map.setLayoutProperty('hex-small', 'visibility', hexVisibility ? 'visible' : 'none');
            map.setLayoutProperty('hex-borders-small', 'visibility', hexVisibility ? 'visible' : 'none');
        }

    }, [hexVisibility, map])

    useEffect(() => { // hide/show speed limits
        if (map) {
            map.setLayoutProperty('speed-limit-lines', 'visibility', speedVisibility ? 'visible' : 'none');
        }

    }, [speedVisibility, map])

    useEffect(() => { // filter years
        if (map) {
            let yearFilter = []
            // iterate through the `years` state var, which is controlled by the years slider in the Controls menu
            // for each year, add a filtering string that can be added to the map layer
            years.forEach((year) => {
                yearFilter.push(['in', year.toString(), ['get', 'd']])
            })

            // apply year filter to all point layers
            const pointLayers = ['points-death', 'points-injuries', 'points-minor']
            if (yearFilter.length > 0) {
                // apply popup function to all points layers
                pointLayers.map((id) => map.setFilter(id, ['any', ...yearFilter]))
            } else {
                pointLayers.map((id) => map.setFilter(id, null))
            }
        }
    }, [years, map])

    useEffect(() => { // hide/show fatal crash points
        if (map) {
            map.setLayoutProperty('points-death', 'visibility', showDeaths ? 'visible' : 'none')
        }
    }, [showDeaths, map])

    useEffect(() => { // hide/show nonfatal crash points
        if (map) {
            map.setLayoutProperty('points-minor', 'visibility', showMinorCrashes ? 'visible' : 'none');
        }
    }, [showMinorCrashes, map])

    useEffect(() => { // hide/show crash points with injuries
        if (map) {
            map.setLayoutProperty('points-injuries', 'visibility', showInjuries ? 'visible' : 'none');
        }
    }, [showInjuries, map])


    return (
        <div ref={mapContainer} className="mapContainer" />
    )
}


export default Map