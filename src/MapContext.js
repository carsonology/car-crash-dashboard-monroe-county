import React, { useState, useEffect } from "react"
import './App.css'
import Map from './Map.js'
import mapboxgl from 'mapbox-gl'
import fatalDataImport from './data/master_deaths.min.geojson'
import useMobileDetect from 'use-mobile-detect-hook'

function MapContext(props) {
    const {
        menuOpen,
        setMenuOpen,
        hexVisibility,
        speedVisibility,
        showDeaths,
        showInjuries,
        showMinorCrashes,
        years
    } = props

    const [fatalData, setFatalData] = useState(fatalDataImport)

    // check if the user is on mobile
    const detectMobile = useMobileDetect()
    // if the user clicks outside of the menu on mobile, turn off the menu
    const menuOff = () => {
        console.log('clicking')
        if (detectMobile.isMobile() && menuOpen) {
            setMenuOpen(false)
        }
    }

    useEffect(() => {
        fetch(fatalData)
            .then(response => {
                return response.json();
            })
            .then(data => setFatalData(data));
    }, [])

    mapboxgl.accessToken = 'pk.eyJ1IjoiY3RlcmJ1c2giLCJhIjoiY2t0dnZrYjM4MmU0aDJvbzM1dTFqbDY1NiJ9.zdZur9mZOlVhIxAoiqVwBA'

    return (
        <div onClick={menuOff}>
            <Map
                fatalData={fatalData}
                hexVisibility={hexVisibility}
                speedVisibility={speedVisibility}
                showDeaths={showDeaths}
                showInjuries={showInjuries}
                showMinorCrashes={showMinorCrashes}
                years={years}
            />
        </div>
    )
}

export default MapContext;
