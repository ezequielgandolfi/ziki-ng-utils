import { ZikiDateUtils } from "./date-utils";

export class ZikiJsonUtils {

    public static assign(target: Object, source: Object) {
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
                        newObject[field] = ZikiDateUtils.toDate(newObject[field]);
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
                if ((typeSource == "string") && (ZikiDateUtils.isISODate(newObject[field]))) {
                    newObject[field] = ZikiDateUtils.toDate(newObject[field]);
                }
            }
        }

        Object.assign(target, newObject);
        return target;
    }

}
