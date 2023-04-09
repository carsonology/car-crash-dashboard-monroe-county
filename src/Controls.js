import React from "react"
import './App.css'
import ControlButton from './ControlButton.js'

function Controls(props) {
    // console.log('hi')
    const {
        hexVisibility,
        setHexVisibility,
        // districtVisibility,
        // setDistrictVisibility,
        showDeaths,
        setShowDeaths,
        showInjuries,
        setShowInjuries,
        showMinorCrashes,
        setShowMinorCrashes,
        years,
        setYears
    } = props
    return (
        <div className="Controls" style={{
            // height: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            flexFlow: 'column nowrap',
            overflow: 'scroll'
        }}>
            <div>
                <svg className="logo" viewBox="0 0 163.17 68.85">
                    <path d="M0,67.77V1.08H19.89V67.77Z" />
                    <path
                        d="M32.85,67.77V1.08H58.32c19.44,0,38.34,6.21,38.34,33.3,0,26.64-20.07,33.39-39.6,33.39ZM52.74,50.4h5.85c12.06,0,17.91-4.41,17.91-16s-5.67-15.3-18.81-15.3H52.74Z" />
                    <path
                        d="M98.82,59l9.54-13.59c6.66,4.59,15.93,7,23.31,7,9.45,0,11.7-2.16,11.7-4.86s-2.7-3.78-12.51-4.59c-14.31-1.17-28.26-4.86-28.26-21.15C102.6,5.67,115.83,0,131,0c15.84,0,24.48,4.05,29.16,7.83l-9.9,14.31c-3.78-2.52-12.33-4.77-19-4.77s-8.73,1.08-8.73,3.69c0,3.24,2.79,4.05,12.69,4.86,14.94,1.26,28,4.14,28,20.7,0,13.5-11.52,22.23-30.87,22.23C114.66,68.85,105.84,64.53,98.82,59Z" />
                </svg>
                <h1>Monroe County Crash Dashboard</h1>
                {/* <p><em><a href="#" >About the data</a></em></p> */}

                <h2>Key</h2>
                <div style={{ display: "flex", jusitfyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{
                        height: '15px',
                        width: '15px',
                        backgroundColor: 'yellow',
                        borderRadius: '50%',
                        opacity: .5,
                        marginRight: '8px'
                    }} />
                    <label>
                        <span>Nonfatal crash</span>
                    </label>
                </div>
                <div style={{ display: "flex", jusitfyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{
                        height: '15px',
                        width: '15px',
                        backgroundColor: 'orange',
                        borderRadius: '50%',
                        marginRight: '8px'
                    }} />
                    <label>
                        <span>Crash involving injury</span>
                    </label>
                </div>
                <div style={{ display: "flex", jusitfyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{
                        height: '15px',
                        width: '15px',
                        backgroundColor: 'red',
                        borderRadius: '50%',
                        marginRight: '8px'
                    }} />
                    <label>
                        <span>Fatal crash</span>
                    </label>
                </div>

                <label>
                    <span>Number of crashes contained in each hexagon (2003-2022)</span>
                </label>
                <div style={{
                    display: 'flex',
                    width: '100%',
                    flexFlow: 'row wrap',
                    position: 'relative',
                    marginTop: 8,
                    marginBottom: 25
                }}>
                    <div style={{
                        height: 20,
                        background: 'rgb(119, 216, 240)',
                        opacity: .1,
                        flex: 1
                    }}>
                    </div>
                    <div style={{
                        height: 20,
                        background: 'rgb(119, 216, 240)',
                        opacity: .3,
                        flex: 1
                    }}>

                    </div><div style={{
                        height: 20,
                        background: 'rgb(119, 216, 240)',
                        opacity: .5,
                        flex: 1
                    }}>

                    </div><div style={{
                        height: 20,
                        background: 'rgb(119, 216, 240)',
                        opacity: .7,
                        flex: 1
                    }}>

                        <p style={{
                            position: 'absolute',
                            top: 15,
                            left: '21%',
                            color: 'white',
                            textAlign: 'center'
                        }}>100</p>
                        <p style={{
                            position: 'absolute',
                            top: 15,
                            left: '46%',
                            color: 'white',
                            textAlign: 'center'
                        }}>500</p>
                        <p style={{
                            position: 'absolute',
                            top: 15,
                            left: '68%',
                            color: 'white',
                            textAlign: 'center'
                        }}>1,000</p>

                    </div>
                </div>

                <h2>Filters</h2>
                <div>
                    <ControlButton
                        type="checkbox"
                        textOn="Fatal crashes"
                        textOff="Fatal crashes"
                        flag={showDeaths}
                        setFlag={setShowDeaths}
                        color={'red'}
                    />
                    <ControlButton
                        type="checkbox"
                        textOn="Crashes involving injuries"
                        textOff="Crashes involving injuries"
                        flag={showInjuries}
                        setFlag={setShowInjuries}
                        color={'orange'}
                    />
                    <ControlButton
                        type="checkbox"
                        textOn="Crashes with no deaths or injuries"
                        textOff="Crashes with no deaths or injuries"
                        flag={showMinorCrashes}
                        setFlag={setShowMinorCrashes}
                        color={'yellow'}
                    />
                    <ControlButton
                        type="year-filter"
                        textOn="Year"
                        textOff="Year"
                        flag={years}
                        setFlag={setYears}
                    />
                </div>
                {/* <ControlButton
                    type="toggle"
                    textOn="City council districts shown"
                    textOff="City council districts hidden"
                    flag={districtVisibility}
                    setFlag={setDistrictVisibility}
                    setSecondaryFlag={setHexVisibility}
                /> */}
                <ControlButton
                    type="toggle"
                    textOn="Hexagons "
                    textOff="Hexagons"
                    flag={hexVisibility}
                    setFlag={setHexVisibility}
                // setSecondaryFlag={setDistrictVisibility}
                />

                <h2>Style</h2>
            </div>
            {/* <p><strong>Source:</strong> <a href="#">IDS analysis</a> of <a href="https://data.bloomington.in.gov/dataset/traffic-data">Bloomington traffic data</a></p> */}
            <p><strong>Source:</strong> IDS analysis of <a href="https://data.bloomington.in.gov/dataset/traffic-data">Bloomington traffic data</a></p>
        </div>
    )
}

export default Controls;


