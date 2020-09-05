import {IStore, Store} from "./Store";

export class LocalStore implements IStore{
    key: string;

    constructor(key: string) {
        this.key = key;
    }

    load(): object {
        let obj = localStorage.getItem(this.key)
        return JSON.parse(obj)
    }

    save(key: string, value: string): void {
        let obj = this.load();
        if (!obj) obj = {};
        obj = this.updateObject(obj, key, value);
        localStorage.setItem(this.key, JSON.stringify(obj))
    }

    updateObject(obj: object, path: string, value: string): object {
        let pList = path.split('.');
        let len = pList.length;
        for(let i = 0; i < len-1; i++) {
            let elem = pList[i];

            // @ts-ignore
            if( !obj[elem] ) obj[elem] = {};
            // @ts-ignore
            obj= obj[elem];
        }

        // @ts-ignore
        obj[pList[len-1]] = value;
        return obj;
    }

}