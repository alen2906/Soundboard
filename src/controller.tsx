import React, { useRef, useState, useEffect, useReducer } from 'react'
import { ExtendedAudioElement } from './App'
import Pad from './pad'
const { myIpcRenderer } = window


const Controller : React.FunctionComponent = () => {
    const [paths, setPaths] = useState<string[]>()
    const [outputs, setOutputs] = useState<MediaDeviceInfo[]>()
    const [selectedPrimaryOutput, setSelectedPrimaryOutput] = useState<string>('default')
    const [selectedSecondaryOutput, setSelectedSecondaryOutput] = useState<string>('default')
    const primaryRef = useRef<HTMLSelectElement>(null)
    const secondaryRef = useRef<HTMLSelectElement>(null)



    const handlePrimaryOutputChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedPrimaryOutput(event.currentTarget.value)
        localStorage.setItem('primary_output', event.currentTarget.value)
    }

    const handleSecondaryOutputChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSecondaryOutput(event.currentTarget.value)
        localStorage.setItem('secondary_output', event.currentTarget.value)
    }

    const loadConfig = () => {
        let output_1 = localStorage.getItem('primary_output')
        if (output_1) setSelectedPrimaryOutput(output_1)

        let ref = primaryRef.current!
        var options = Array.from(ref.options)
        
        options.map((option, i) => {
            if (option.value === output_1) {
                option.selected = true
            }
        })
        
        let output_2 = localStorage.getItem('secondary_output')
        if (output_2) setSelectedSecondaryOutput(output_2)

        ref = secondaryRef.current!
        options = Array.from(ref.options)
        
        options.map((option, i) => {
            if (option.value === output_2) {
                option.selected = true
            }
        })

        let loaded_paths = localStorage.getItem("paths");
        if (loaded_paths) setPaths(JSON.parse(loaded_paths))
    
    }

    useEffect(() => {    

        navigator.mediaDevices.enumerateDevices()
            .then( devices => {
                devices = devices.filter((output) => output.kind === "audiooutput")
                setOutputs(devices)
                loadConfig()
            })
        
        myIpcRenderer.on('APP_dialogResponse', (result) => {
           setPaths(result)
           localStorage.setItem("paths", JSON.stringify(result))
        })        
    }, [])
    
    const handlePathSelection = () => {
        myIpcRenderer.invoke('APP_showDialog')
    }
    

    return(
    <div>   

            <select onChange={ handlePrimaryOutputChange } ref={primaryRef}>
            {outputs && outputs.map((output, index) => 
                <option key={index} value={ output.deviceId }>{ output.label }</option>  
            )}
            </select>
            
            <select onChange={ handleSecondaryOutputChange} ref={secondaryRef}>
            {outputs && outputs.map((output, index) => 
                <option key={index} value={ output.deviceId }>{ output.label }</option>  
            )}
            </select>
            
            
            <p>Selected Primary: {selectedPrimaryOutput} </p>
            <p>Selected Secondary: { selectedSecondaryOutput } </p>
            
            <button onClick={handlePathSelection}>Select Audio Folder</button>

            {paths && paths.map((path, index) => 
                <Pad key={index} outputs={ [selectedPrimaryOutput, selectedSecondaryOutput] } source={path}></Pad>
            )}
    </div>
    )
}

export default Controller