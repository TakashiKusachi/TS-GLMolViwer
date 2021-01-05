
import {ISystem,IBond,IAtom} from "./system"
import {System,Atom } from "./system"


export {System,ISystem,IAtom,IBond,Atom}

/**
export type AnySystem = CarSystem;
export function deserializeSystem(system:AnySystem):AnySystem{
    switch (system.systemName){
        case "car":
            return CarSystem.getSystem(system );
        default:
            throw Error("");
    }
}
*/