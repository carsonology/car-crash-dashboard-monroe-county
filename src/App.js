import React, { useState } from "react";
import './App.css';
// import Map from './Map.js'
import MapContext from './MapContext.js'
import Controls from './Controls.js'

function App() {

  const [hexVisibility, setHexVisibility] = useState(true)
  // const [districtVisibility, setDistrictVisibility] = useState(false)
  const [showDeaths, setShowDeaths] = useState(true)
  const [showInjuries, setShowInjuries] = useState(true)
  const [showMinorCrashes, setShowMinorCrashes] = useState(true)
  const [years, setYears] = useState([2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022])

  return (
    <div className="App">
      <Controls
        hexVisibility={hexVisibility}
        setHexVisibility={setHexVisibility}
        // districtVisibility={districtVisibility}
        // setDistrictVisibility={setDistrictVisibility}
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
        // districtVisibility={districtVisibility}
        showDeaths={showDeaths}
        showInjuries={showInjuries}
        showMinorCrashes={showMinorCrashes}
        years={years}
      />
    </div>
  )
}

export default App;
