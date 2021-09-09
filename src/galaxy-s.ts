import { UserS } from "./user-s";
import { fork, ChildProcess } from "child_process"
import { GalaxyI, GalaxySettingsI, SendFormatI } from "./common/declarations";

export class GalaxyS {
    static sendWholeDataInterval = 10

    users: UserS[] = []
    data: GalaxyI | undefined = undefined
    connectionE: ChildProcess | undefined = undefined
    settings: GalaxySettingsI

    private swdiCount = 0

    constructor(s: GalaxySettingsI) {
        this.settings = s
    }

    send(m: SendFormatI) {
        if (this.connectionE) this.connectionE.send(m)
        return this.connectionE !== undefined
    }

    onmessageE(m: any) {
        if (m.user)
            this.users.find(u => u.props.id === m.user)?.onmessageE(m)
        
        else {
            if (m.header === 'galaxy data') this.sendDataToClients(m.value)
        }
    }

    sendDataToClients(g: GalaxyI) {
        this.data = g
        if (this.swdiCount === GalaxyS.sendWholeDataInterval)  {
            this.users.forEach(u => u.sendWholeData(this.data!))
            this.swdiCount = 0
        }
        else {
            this.users.forEach(u => u.sendImportantData(this.data!))
            this.swdiCount ++
        }
    }

    initChildProcess() {
        this.connectionE = fork('./galaxy-environment/index.ts')
        this.connectionE.on('message', (o) => {
            const m = JSON.parse(o as string)
            if (m) this.onmessageE(m)
        })
    }

}