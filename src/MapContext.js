import React, { useState } from "react"
import './App.css'
import Map from './Map.js'
import mapboxgl from 'mapbox-gl';


function MapContext(props) {
    const {
        hexVisibility,
        speedVisibility,
        showDeaths,
        showInjuries,
        showMinorCrashes,
        years
    } = props

    mapboxgl.accessToken = 'pk.eyJ1IjoiY3RlcmJ1c2giLCJhIjoiY2t0dnZrYjM4MmU0aDJvbzM1dTFqbDY1NiJ9.zdZur9mZOlVhIxAoiqVwBA'

    return (
        <>
            <Map
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
