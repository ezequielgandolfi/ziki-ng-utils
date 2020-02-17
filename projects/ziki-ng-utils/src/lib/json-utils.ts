import { isISODateString, getDate } from "./date-utils";

export function assign(target: Object, source: Object) {
    let referenceObject = new (Object.getPrototypeOf(target).constructor)();
    let newObject = Object.assign({}, source);
    let fieldsSource = Object.keys(newObject);
    let fieldsTarget = Object.keys(referenceObject);
    for (let i in fieldsSource) {
        let field = fieldsSource[i];
        let typeSource: string = (typeof (newObject[field])).toLowerCase();
        if (fieldsTarget.includes(field)) {
            let typeTarget: string = (typeof (referenceObject[field])).toLowerCase();
            if (typeSource != typeTarget) {
                if (referenceObject[field] instanceof Date) {
                    newObject[field] = getDate(newObject[field]);
                }
                else if (typeTarget == "number") {
                    newObject[field] = Number(newObject[field] || 0).valueOf();
                }
                else if (typeTarget == "string") {
                    newObject[field] = String(newObject[field] || '').valueOf();
                }
                else if (typeTarget == "boolean") {
                    newObject[field] = Boolean(newObject[field] || false).valueOf();
                }
            }
        }
        else {
            if ((typeSource == "string") && (isISODateString(newObject[field]))) {
                newObject[field] = getDate(newObject[field]);
            }
        }
    }

    Object.assign(target, newObject);
    return target;
}

