import * as WS from "websocket";
import { createServer } from "http"
import { User } from "./galaxy-environment/implementations/user";
import { GalaxyE } from "./galaxy-environment/implementations/galaxy";
import { removeItem } from "./common/adds";

export const consts = {
    targetReloadTime: 20,
    sendWholeDataInterval: 10 // x * [reloadInterval] !
}

export let server: WS.server

export let loginUsers: User[] = []
export let galaxies: GalaxyE[] = []
export let recalcInterval: NodeJS.Timer

export function removeLoginUser(u: User) {
    return removeItem(loginUsers, u)
}

let idCount = Number.MIN_SAFE_INTEGER
let sendWholeDataIntervalCount = 0

export function newID() {
    idCount ++
    if (idCount === 0) idCount ++ // a user will never have the id 0
    return idCount
}

export function logAllUsers(why: string) {
    const p = (users: User[], name: string) => {
        console.log(name + ':')
        users.forEach(u => console.log('    Name: ' + u.props.name + ' | ID: ' + u.props.id + ' | Galaxy: ' + u.props.galaxy))
        if (users.length === 0) console.log('   [empty]')
        console.log()
    }

    console.log()
    console.log('------------- Logging All Users -------------')    
    console.log('User data (' + why + '):')
    console.log()
    p(loginUsers, 'Login Users')
    galaxies.forEach((g) => p(g.users, g.galaxyParams.name))
    console.log('---------------------------------------------')
    console.log()
}

export function init() {
    const httpServer = createServer()

    httpServer.listen(1234, () => {
        console.log("Server is listening on port 1234...") // IDEA: integrate command params
        console.log('------------------')
        console.log()

        server = new WS.server({
            httpServer: httpServer,
            autoAcceptConnections: false
        })
    
        server.on('request', request => {
            loginUsers.push(new User(
                request.accept('crazyrocket', request.origin),
                newID()
            ))
            logAllUsers('User added.')
        })
    })

    let factor = 0
    
    while (true) {
        const t1 = Date.now()
        galaxies.forEach(g => {
            g.calculated = false
            g.fps = (1/factor) * (1000 / consts.targetReloadTime)
        })
        galaxies.forEach(g => {
            g.calc(factor)
            g.users.forEach(u => u.calcView())
        })
        const t2 = Date.now()

        factor = (t2 - t1) / consts.targetReloadTime

        galaxies.forEach(g => {
            g.users.forEach(u => {
                if (sendWholeDataIntervalCount === consts.sendWholeDataInterval) {
                    u.sendGalaxyData()
                } else u.sendImportantData()
            })
        })

        if (sendWholeDataIntervalCount < consts.sendWholeDataInterval) sendWholeDataIntervalCount ++
        else sendWholeDataIntervalCount = 0
    }
}