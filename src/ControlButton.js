import React, { useState, useEffect, Fragment } from "react"
import './App.css'
import Switch from "react-switch"
import ReactSlider from 'react-slider'
// import 'react-input-checkbox/lib/react-input-checkbox.min.css';
import { Checkbox } from 'react-input-checkbox';
// import Select from 'react-select'
import MultiRangeSlider from "multi-range-slider-react";

function ControlButton(props) {

    const { type, textOn, textOff, flag, setFlag, flagSecondary, smallLabels, setSecondaryFlag, color } = props

    const [text, setText] = useState(textOn)

    const [minYear, setMinYear] = useState(null)
    const [maxYear, setMaxYear] = useState(null)

    const onChange = () => {
        if (type == "toggle" || type == "checkbox") {
            setFlag(!flag)
            if (setSecondaryFlag) {
                // console.log('setting secondary flag', setSecondaryFlag)
                setSecondaryFlag(flag)
            }
            setText(flag ? textOff : textOn)
        } else if (type == "slider") {

        }
    }


    useEffect(() => {
        if (minYear) {
            const arrLength = maxYear - minYear + 1
            let nums = [...Array(arrLength).keys()]

            nums = nums.map((num) => num + minYear)
            setFlag(nums)
        }
    }, [minYear, maxYear])

    switch (type) {
        case "toggle":
            return (
                <div className="dashControl">
                    <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        {/* {color && <div style={{
                            height: '15px',
                            width: '15px',
                            backgroundColor: color,
                            borderRadius: '50%',
                            marginRight: '8px'
                        }} />} */}
                        <span>{text}</span>

                        <Switch
                            className={'react-switch'}
                            onChange={onChange}
                            checked={flag}
                            // onColor={"#000"}
                            offColor={"#bda8a8"}
                            handleDiameter={16}
                            checkedIcon={false}
                            uncheckedIcon={<Fragment />}
                            height={22}
                            width={45}
                        />
                    </label>
                </div>
            )
        case "checkbox":
            return (
                <div className="dashControl">
                    <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>{text}</span>
                        <Checkbox
                            // theme="fancy-checkbox"
                            // disabled={props.disabled}
                            value={flag}
                            onChange={onChange}
                        />
                    </label>
                </div>
            )
        case "slider":
            return (
                <div className="dashControl">
                    <label className={`react-slider ${flagSecondary !== 'null' ? !flagSecondary ? 'disabled' : '' : ''}`}>
                        <span>{textOn}</span>
                        <ReactSlider
                            disabled={flagSecondary !== 'null' ? !flagSecondary : false}
                            defaultValue={2}
                            markClassName="mark"
                            className="react-slider"
                            min={1}
                            max={4}
                            // marks={1}
                            thumbClassName="thumb"
                            trackClassName="track"
                            onChange={(val) => setFlag(val)}
                        // renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
                        />
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span className="small-label">{smallLabels[0]}</span>
                            <span className="small-label">{smallLabels[1]}</span>
                        </div>
                    </label>
                </div>
            )
        case "year-filter":

            return (
                <label>
                    <span>Years</span>
                    <MultiRangeSlider
                        className={'year-slider'}
                        min={2003}
                        max={2022}
                        step={1}
                        minValue={2003}
                        maxValue={2022}
                        onInput={(e) => {
                            setMinYear(e.minValue)
                            setMaxYear(e.maxValue)
                        }}
                        ruler='false'
                    />
                </label>
            )
    }
}

export default ControlButton;


