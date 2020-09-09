

export function match(lista:string[],listb:string[]){
    let checklist = lista.filter((value)=>{
        return listb.indexOf(value) != -1;
    })

    return (checklist.length == lista.length) && (checklist.length == listb.length);
}

export function getExtension(file: File): string|undefined{
    return file.name.split('.').pop();
}

export function searchFile(files: File[],extension: string): File[]{
    return files.filter((value)=>{
        return getExtension(value) == extension;
    });
}