import { DatableI, DataCalcI, GeoI, MovingObjectI } from "../../common/declarations";
import { Geo, Vector } from "../../common/math";
import { GalaxyReference_ } from "../../declarations";
import { newID } from "../../server";
import { GalaxyE } from "./galaxy";
import { User } from "./user";

export abstract class MovingObject implements MovingObjectI, DataCalcI<MovingObjectI>, GalaxyReference_ {
    abstract img: string
    id: number
    movingVector = new Vector(0,0)
    myGalaxy: () => GalaxyE
    geo: Geo

    constructor(myGalaxy: () => GalaxyE, id?: number, geo?: GeoI) {
        this.id = id ? id : newID()
        this.geo = new Geo(geo)
        this.myGalaxy = myGalaxy
    }

    setSpeed(s: number) { this.movingVector = this.movingVector.e().mul(s) }
    turn(a: number) { this.movingVector = Vector.fromAL(a, this.movingVector.l()) }
    calc(s: number) { this.geo.pos = this.geo.pos.plus(this.movingVector.mul(s)) }

    data() {
        return {
            geo: this.geo.geoData(),
            img: this.img,
            movingVector: this.movingVector.data(),
            id: this.id
        }
    }
}