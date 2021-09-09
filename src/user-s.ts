import * as WS from "websocket";
import { GalaxyS } from "./galaxy-s";
import { GalaxyI, SendFormatI, UserPropsI } from "./common/declarations";

export class UserS {
    connection: WS.connection

    props: UserPropsI = {
        name: 'UNNAMED',
        galaxy: '',
        id: 0
    }

    constructor(c: WS.connection, id: number) {
        this.props.id = id
        this.connection = c
        this.initSocket()
    }

    send(h: string, v?: any, loud?: boolean) {
        if (loud === true) {
            this.log('sending...')
            console.log({
                header: h,
                value: v
            })
            console.log()
        }
        
        if (this.connection.send) this.connection.send(JSON.stringify({
            header: h,
            value: v
        }))
    }

    log(s: any) {
        console.log('UserS [' + this.props.name + '] logs: ' + s)
    }

    private onmessageC(m: any) {
        const printOut = () => {
            this.log('[from client] recieving data...')
            console.log(m)
            console.log()
        }

        if (m.header === 'create new galaxy') {
            printOut()
            const g = createGalaxy(m.value.galaxy)
            if (g) {
                logAllUsers('Galaxy created.')
                this.send(
                    'galaxy successfully created', 
                    m.value.reason
                )
            } else this.send('creating galaxy failed') // TODO
        }

        if (m.header === 'join galaxy') {
            printOut()

            const succesfullyJoined = this.joinGalaxy(m.value.user.galaxy)
            if (succesfullyJoined) {
                this.props = { ...m.value.user, id: this.props.id }
                this.screenWidth = m.value.screenWidth
                this.screenHeight = m.value.screenHeight
                logAllUsers('User joined.')

                this.send(
                    'succesfully joined',
                    { id: this.props.id }
                )
            } else this.send('joining failed')
        }
        if (m.header === 'keyboard data')
            this.keyboard = m.value
            
        if (m.header === 'touching objects') this.myRocket()!.touchingObjects = m.value
    }

    onmessageE(m: any) {
        const printOut = () => {
            this.log('[from environment] recieving data...')
            console.log(m)
            console.log()
        }

        // TODO
    }

    sendWholeData(d: GalaxyI) {
        // TODO
    }
    sendImportantData(d: GalaxyI) {
        // TODO
    }

    private initSocket() { // DONE: onclose!
        this.connection.on('message', (m) => {
            if (m.utf8Data) {
                const parse = JSON.parse(m.utf8Data)

                if (parse) this.onmessageC(parse)
            } else this.log('data is null!')
        })
        this.connection.on('error', (e) => console.error(e))
        this.connection.on('close', () => { this.close() })
    }
}