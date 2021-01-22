
enum change_type {
    POSITION,
}

type cahngeObject = {
    type: change_type;
}

export type positionChange= cahngeObject & {
    type: change_type.POSITION;
    name: string;
    newPosition: number[];
    oldPosition: number[];
}