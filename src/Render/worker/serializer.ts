
import {Serializer,SerializerImplementation, JsonSerializable} from 'threads'
import {ObjectLoader,Group} from 'three'
import { serialize } from 'v8'

export type SerializedThreeGroup = JsonSerializable & {    
    __type: "$$ThreeGroup",
    state: string,
}

export const GroupSerializer: Serializer<SerializedThreeGroup,Group>={

    deserialize(message:SerializedThreeGroup){
        let loader = new ObjectLoader();
        return loader.parse(message.state);
    },
    serialize(input: Group){
        input.updateMatrixWorld();
        return {
            state: input.toJSON(),
            __type: "$$ThreeGroup"
        }
    }
}

export const GroupSerializerImplementation: SerializerImplementation<SerializedThreeGroup,Group | any> ={
    deserialize(message,defaultHandler){
        if(message.__type === "$$ThreeGroup"){
            //console.log("Group deserializer",message.state)
            return GroupSerializer.deserialize(message);
        }else{
            //console.log("Other deserializer")
            return defaultHandler(message);
        }
    },
    serialize(input,defaultHandler){
        if(input instanceof Group){
            //console.log("Group serializer")
            return GroupSerializer.serialize(input);
        }else{
            //console.log("other serializer")
            return defaultHandler(input);
        }
    },
}