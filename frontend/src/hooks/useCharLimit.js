import { useState } from "react";

export default function useCharLimit(limit, fieldName) {
    const [value, setValue] = useState("")
    const [warning, setWarning] = useState("")

    const handleChange = (e) => {
        const newValue = e.target.value
        setValue(newValue)

        if(newValue.length <= limit && warning){
            setWarning("")
        }
    }

    const handleBlur = () => {
        if(value.length > limit){
            setWarning(`Maximum of ${limit} characters allowed for ${fieldName}.`)
        }
    }

    return { value, setValue, onChange: handleChange, onBlur: handleBlur, warning }
}