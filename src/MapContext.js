import React, { useState, useEffect } from "react"
import './App.css'
import Map from './Map.js'
// import geojson from 'https://raw.githubusercontent.com/carsonology/crash-data/main/master_crash_clean.min.geojson?token=GHSAT0AAAAAACASYJVWBVYK2IHSMY7KBEJ6ZBLJOSA'
import geojson from './data/master_crash_clean.min.geojson'
// import geojson from './data/master_crash_clean.sample.min.geojson'
import mapboxgl from 'mapbox-gl';
import hexagon_data_large from './data/hexagon-data-large.min.geojson'
import hexagon_data_medium from './data/hexagon-data-medium.min.geojson'
import hexagon_data_small from './data/hexagon-data-small.min.geojson'
import * as turf from '@turf/turf'


function MapContext(props) {
    const {
        hexVisibility,
        // districtVisibility,
        showDeaths,
        showInjuries,
        showMinorCrashes,
        years
    } = props

    mapboxgl.accessToken = 'pk.eyJ1IjoiY3RlcmJ1c2giLCJhIjoiY2t0dnZrYjM4MmU0aDJvbzM1dTFqbDY1NiJ9.zdZur9mZOlVhIxAoiqVwBA'

    // const geojson = 'https://raw.githubusercontent.com/carsonology/crash-data/main/master_crash_clean.min.geojson'
    // const geojson = 'https://raw.githubusercontent.com/carsonology/crash-data/main/master_crash_clean.sample.min.geojson?token=GHSAT0AAAAAACASYJVWHAPSSNAAYY6IYKTGZBLJP6A'
    const [data, setData] = useState(geojson)
    const [hexGridDataLarge, setHexGridDataLarge] = useState(hexagon_data_large)
    const [hexGridDataMedium, setHexGridDataMedium] = useState(hexagon_data_medium)
    const [hexGridDataSmall, setHexGridDataSmall] = useState(hexagon_data_small)


    /*
        METHOD TO GENERATE HEXAGONS
        Only run this once, then use the button commented out in the 
        return statement to download the result as a geojson file.
        That way this time-consuming geoanalysis won't run on every
        reload of the map.
    */
    // useEffect(() => {
    //     const bbox = [-86.70764843085207, 38.980672784175255, -86.33708588689486, 39.54695628365925]
    //     const cellSide = .2;
    //     const options = {};
    //     const hexagons = turf.hexGrid(bbox, cellSide, options);

    //     hexagons.features.map((hex, i) => {
    //         const internalData = turf.within(data, hex).features
    //         hex.id = i
    //         hex.properties.data = internalData.map((d) => d.properties)
    //         hex.properties.numPoints = internalData.length
    //         return hex
    //     })

    //     hexagons.features.filter((hex) => hex.numPoints > 0)

    //     const binWMostPoints = hexagons.features.reduce(
    //         (prev, current) => {
    //             return prev.properties.numPoints > current.properties.numPoints ? prev : current
    //         }
    //     )

    //     hexagons.features.map((hex) => {
    //         hex.properties.density = hex.properties.numPoints / binWMostPoints.properties.numPoints
    //         return hex
    //     })

    //     setHexGridData(hexagons)
    // }, [data])


    // comment this out when using the above Turf functionality to generate
    // the hex data
    useEffect(() => {
        fetch(hexGridDataLarge)
            .then(response => {
                return response.json();
            })
            .then(data => setHexGridDataLarge(data));
        fetch(hexGridDataMedium)
            .then(response => {
                return response.json();
            })
            .then(data => setHexGridDataMedium(data));
        fetch(hexGridDataSmall)
            .then(response => {
                return response.json();
            })
            .then(data => setHexGridDataSmall(data));
    }, [])

    useEffect(() => {
        fetch(data)
            .then(response => {
                return response.json();
            })
            .then(data => setData(data));

    }, [])

    return (
        <>
            <Map
                data={data}
                hexVisibility={hexVisibility}
                // districtVisibility={districtVisibility}
                hexGridDataLarge={hexGridDataLarge}
                hexGridDataMedium={hexGridDataMedium}
                hexGridDataSmall={hexGridDataSmall}
                showDeaths={showDeaths}
                showInjuries={showInjuries}
                showMinorCrashes={showMinorCrashes}
                years={years}
            />
            {/* button used to download geojson after turf completes calculations based on above code */}
            {/* <a style={{
                backgroundColor: 'pink',
                display: 'block',
                position: 'fixed',
                zIndex: 200,
                right: 15,
                top: '50%',
                color: 'black',
                padding: 15
            }}
                href={`data:text/json;charset=utf-8,${encodeURIComponent(
                    JSON.stringify(hexGridData)
                )}`}
                download="hexagon-data.json"
            >
                {`Download Json`}
            </a> */}
        </>
    )
}

export default MapContext;
