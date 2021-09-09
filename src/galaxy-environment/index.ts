import { SendFormatI } from "../common/declarations"
import { GalaxyE } from "./implementations/galaxy"

let galaxyE: GalaxyE

const constsE = {
    targetReloadTime: 20,
}

process.on('message', (o: any) => {
    const m = JSON.parse(o as string)

    if (m) {
        if (m.header === 'initialize') {
            if (m.type === 'create new') {
                galaxyE = new GalaxyE(m.value.params)
                galaxyE.initGalaxy()
            } // else ... TODO: import data in a galaxy
        }
    }

})

let factor = 0

export function sendE(
    m: SendFormatI, 
    callback?: (error: Error | null) => void
) { process.send!(JSON.stringify(m), callback) }

export function logE(s: string) {
    console.log('   [child-process] ' + galaxyE ? galaxyE.galaxyParams.name : 'NOT INIT' + ' logs: ' + s)
}

function calcLoop() {
    if (galaxyE) {
        const t1 = Date.now()

        galaxyE.fps = (1/factor) * (1000 / constsE.targetReloadTime)
        galaxyE.calc(factor)

        sendE({
            header: 'galaxy data', 
            value: galaxyE.data(),
        }, (err) => {
            if (!err) {
                const t2 = Date.now()
                factor = (t2 - t1) / constsE.targetReloadTime
                calcLoop()
            }
            else {
                logE('Error during sending...')
                console.error(err)
            }
        })
    } else setTimeout(() => { calcLoop() }, 1)
}