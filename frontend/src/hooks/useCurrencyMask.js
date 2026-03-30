import { useState } from "react";

export function useCurrencyMask(initialValue = ""){
    const [value, setValue] = useState(initialValue)

    const handleChange = (e, language) => {
        let inputValue = e.target.value

        inputValue = inputValue.replace(/\D/g, "")

        if(!inputValue){
            setValue("")
            return
        }

        if(inputValue.length > 7){
            inputValue = inputValue.slice(0, 7)
        }

        const numeric = (parseInt(inputValue, 10) / 100).toFixed(2)

        const formatted = language === "pt" ? (
            `R$ ${numeric
            .replace(".", ",")
            .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`
        ) : (
            `R$ ${numeric
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
        )
        
        setValue(formatted)
    }

    const getNumericValue = (language) => {
        return language === "pt" ? (
            parseFloat(value.replace(/[R$\s.]/g, "").replace(",", ".") || 0)
        ) : (
            parseFloat(value.replace(/[R$\s,]/g, "") || 0)
        )
    }

    return { value, handleChange, getNumericValue, setValue }
}