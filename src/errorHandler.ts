
export class InvalidIdError extends Error{
    constructor(message?:string|undefined){
        super(message)
        this.name="InvalidIdError"
    }
}