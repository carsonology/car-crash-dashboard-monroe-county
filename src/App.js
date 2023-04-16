import React, { useState } from "react";
import './App.css';
import MapContext from './MapContext.js'
import Controls from './Controls.js'
import useMobileDetect from 'use-mobile-detect-hook';

function App() {

  // check if the user is on mobile
  const detectMobile = useMobileDetect()

  const [hexVisibility, setHexVisibility] = useState(false)
  const [speedVisibility, setSpeedVisibility] = useState(true)
  const [showDeaths, setShowDeaths] = useState(true)
  const [showInjuries, setShowInjuries] = useState(true)
  const [showMinorCrashes, setShowMinorCrashes] = useState(true)
  const [years, setYears] = useState([2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022])
  // if it's mobile, hide the menu on the first load
  const [menuOpen, setMenuOpen] = useState(detectMobile.isMobile() ? true : false)

  const menuOn = () => {
    setMenuOpen(true)
  }

  return (
    <div className="App">
      <a onClick={menuOn}>
        <svg className="openBtn" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
          <path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z" />
        </svg>
      </a>
      <Controls
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        hexVisibility={hexVisibility}
        setHexVisibility={setHexVisibility}
        speedVisibility={speedVisibility}
        setSpeedVisibility={setSpeedVisibility}
        showDeaths={showDeaths}
        setShowDeaths={setShowDeaths}
        showInjuries={showInjuries}
        setShowInjuries={setShowInjuries}
        showMinorCrashes={showMinorCrashes}
        setShowMinorCrashes={setShowMinorCrashes}
        years={years}
        setYears={setYears}
      />
      <MapContext
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

export default App;
