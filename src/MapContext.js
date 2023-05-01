import React, { useState, useEffect } from "react"
import './App.css'
import Map from './Map.js'
import mapboxgl from 'mapbox-gl'
import fatalDataImport from './data/master_deaths.min.geojson'
import useMobileDetect from 'use-mobile-detect-hook'

import death_data from './data/master-deaths.min.geojson'
import injury_data from './data/master-injuries.min.geojson'
import other_data from './data/master-nonfatal.min.geojson'

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

    const [fatalData, setFatalData] = useState(null)
    const [injuryData, setInjuryData] = useState(null)
    const [otherData, setOtherData] = useState(null)

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
        fetch(death_data)
            .then(response => {
                return response.json();
            })
            .then(data => setFatalData(data));
        console.log(fatalData)
    }, [])

    useEffect(() => {
        fetch(injury_data)
            .then(response => {
                return response.json();
            })
            .then(data => setInjuryData(data));
    }, [])


    useEffect(() => {
        fetch(other_data)
            .then(response => {
                return response.json();
            })
            .then(data => setOtherData(data));
    }, [])

    mapboxgl.accessToken = 'pk.eyJ1IjoiY3RlcmJ1c2giLCJhIjoiY2t0dnZrYjM4MmU0aDJvbzM1dTFqbDY1NiJ9.zdZur9mZOlVhIxAoiqVwBA'

    return (
        <div onClick={menuOff}>
            {fatalData && injuryData && otherData && (
                <Map
                    fatalData={fatalData}
                    injuryData={injuryData}
                    otherData={otherData}
                    hexVisibility={hexVisibility}
                    speedVisibility={speedVisibility}
                    showDeaths={showDeaths}
                    showInjuries={showInjuries}
                    showMinorCrashes={showMinorCrashes}
                    years={years}
                />
            )
            }
        </div>
    )
}

export default MapContext;
