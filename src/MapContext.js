import React, { useState, useEffect } from "react"
import './App.css'
import Map from './Map.js'
import mapboxgl from 'mapbox-gl'
import fatalDataImport from './data/master_deaths.min.geojson'

function MapContext(props) {
    const {
        hexVisibility,
        speedVisibility,
        showDeaths,
        showInjuries,
        showMinorCrashes,
        years
    } = props

    const [fatalData, setFatalData] = useState(fatalDataImport)

    useEffect(() => {
        fetch(fatalData)
            .then(response => {
                return response.json();
            })
            .then(data => setFatalData(data));
    }, [])

    mapboxgl.accessToken = 'pk.eyJ1IjoiY3RlcmJ1c2giLCJhIjoiY2t0dnZrYjM4MmU0aDJvbzM1dTFqbDY1NiJ9.zdZur9mZOlVhIxAoiqVwBA'

    return (
        <>
            <Map
                fatalData={fatalData}
                hexVisibility={hexVisibility}
                speedVisibility={speedVisibility}
                showDeaths={showDeaths}
                showInjuries={showInjuries}
                showMinorCrashes={showMinorCrashes}
                years={years}
            />
        </>
    )
}

export default MapContext;
