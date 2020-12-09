export class NotSupportOffscreenCanvas extends Error{
    constructor(message?: string){
        super(message)
        this.name = "NotSupportOffscreenCanvas"
    }
}