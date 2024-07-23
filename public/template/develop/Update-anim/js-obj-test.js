"use strict"

let obj = {
    name: "peters",
    vorname: "JP",
    Ort: {
        geburt: "HH"
    }
}

let newObj= {...obj}

obj.Ort.geburt = "H"

console.log(obj)
console.log("___________")

console.log(newObj)