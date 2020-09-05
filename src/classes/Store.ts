export abstract class Store {
    public abstract key: string;
    public abstract load(): object
    public abstract save(key: string, value: string): void
    public abstract updateObject(obj: object, key:string, value:string): object
}

export interface IStore {
    key: string
    load(): object
    save(key: string, value: string): void
    updateObject(obj: object, key:string, value:string): object
}