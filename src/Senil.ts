import {senilConfig} from "./types";
import {IStore, Store} from "./classes/Store";
import {LocalStore} from "./classes/LocalStore";

export default class Senil {

    public state: Object;
    private currentPushItems: Array<Array<any>> = [];
    private config: senilConfig;
    private inputElements: Array<string> = ['INPUT', 'TEXTAREA'];
    private storages: Array<IStore> = [] as Array<IStore>;
    private updateEvent: Event;
    private filterUpdateDom: Function = null
    public listener: any;
    constructor(state: Object, config?: senilConfig, filterUpdateDom: Function = null) {
        this.state = state;
        this.filterUpdateDom = filterUpdateDom
        this.setDefaultConfig(config);
        this.updateEvent = new Event('DomUpdated')
        this.listener = window.addEventListener
        this.init()
    }

    private setDefaultConfig = (config: senilConfig) => {
        if (!config) config = {} as senilConfig;
        if (!config.wrapper) config.wrapper = 'body';
        if (!config.storageKey) config.storageKey= 'senil';
        if (!config.storages) config.storages = {
            localStorage: false
        };
        this.config = config;
    };

    private init = () => {
        this.initStorages();
        this.createInputChangeListeners();
        this.loadFromStorage();
    };

    private initStorages = () => {
        if (this.config.storages.localStorage) {
            let localStore = new LocalStore('x');
            this.storages.push(localStore)
        }
    };

    private loadFromStorage() {
        this.storages.forEach((storage: Store) => {
            let preState = storage.load();
            if (preState)
                this.state = preState
        })
    };

    private saveToStorage(key: string, value: string) {
        this.storages.forEach((storage: Store) => storage.save(key, value))
    }

    private createInputChangeListeners = () => {
        let elements = document.querySelectorAll(this.config.wrapper + " [model]");
        elements.forEach((element, index) => {
            let stateKey = element.getAttribute('model');
            // @ts-ignore
            let _value = this.getValue(stateKey);
            if (this.inputElements.find(name => name === elements[index].nodeName)) {
                // @ts-ignore
                element.value = _value;
                // query all elements including model attribute and listen for their changes
                element.addEventListener('keypress', (evt) => {
                    // @ts-ignore
                    let newValue = evt.target.value;
                    if (Number(newValue)) {
                        newValue = parseFloat(newValue)
                    }
                    this.set({
                        [stateKey]: newValue
                    })
                })
            } else {
                if (this.filterUpdateDom) {
                    element.innerHTML = this.filterUpdateDom(_value)
                }
                else {
                    element.innerHTML = _value
                }
            }

            // check if element has content editable attribute
            const isContentEditable = elements[index].getAttribute('contenteditable');
            if (typeof isContentEditable === 'string') {
                element.addEventListener('input', evt => {
                    this.set({
                        [stateKey]: element.innerHTML
                    })
                })
            }
        })
    };

    public set = (obj: Object) => {
        if (typeof obj === 'object') {
            this.travis(obj)
        }
    };

    private travis =  (obj: any, previous: any = null) => {
        if (typeof obj === 'object') {
            for(let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    let _obj = obj[key];
                    const _key = previous ? previous + '.' + key : key;
                    this.travis(_obj, _key)
                }
            }
        } else {
            let isPreDefinedFn = false;
            // checking for senil defined functions
            if (typeof obj === 'string') {
                let fnObj = obj.match(new RegExp( "__(.*)__"));
                if (fnObj && fnObj[0] && fnObj[1]) {
                    let fn = fnObj[1];
                    // @ts-ignore
                    if (this[fn] instanceof Function) {
                        // @ts-ignore
                        this[fn](previous);
                        isPreDefinedFn = true;
                    }
                }
            }
            if (!isPreDefinedFn) {
                this.setValue(previous, obj);
                this.saveToStorage(previous, obj)
            }
            this.updateDom(previous, obj)
        }
    };

    private setValue = (path: string, value: any) => {
        let schema = this.state;
        let pList = path.split('.');
        let len = pList.length;
        for(let i = 0; i < len-1; i++) {
            let elem = pList[i];

            // @ts-ignore
            if( !schema[elem] ) schema[elem] = {};
            // @ts-ignore
            schema = schema[elem];
        }

        // @ts-ignore
        schema[pList[len-1]] = value;
    };

    private getValue = (path: string) => {
        let schema = this.state;
        let pList = path.split('.');
        let len = pList.length;
        for(let i = 0; i < len-1; i++) {
            let elem = pList[i];
            // @ts-ignore
            if( !schema[elem] ) schema[elem] = {};
            // @ts-ignore
            schema = schema[elem];
        }

        // @ts-ignore
        return schema[pList[len-1]]
    };

    private updateDom = (key: string, value: any) => {
        let elements = document.querySelectorAll(this.config.wrapper + " [model]");
        elements.forEach((element, index) => {
            let stateKey = element.getAttribute('model');
            if (stateKey === key) {
                if (this.inputElements.find(name => name === elements[index].nodeName)) {
                    // @ts-ignore
                    element.value = value
                } else {
                    if (this.filterUpdateDom) {
                        element.innerHTML = this.filterUpdateDom(value)
                    }
                    else {
                        element.innerHTML = value
                    }
                }
            }
        });
        window.dispatchEvent(this.updateEvent)
    };

    public $push(...items: any[]) {
        this.currentPushItems.push(items);
        return '__push__'
    }

    private push(key: string) {
        let currentItems = this.currentPushItems.shift();
        let _item = this.getValue(key);
        currentItems.forEach((value: any) => {
            // @ts-ignore
            _item.push(value);
        });
    }

    public static $pop() {
        return '__pop__'
    }

    private pop(key: string) {
        let _item = this.getValue(key);
        _item.pop()
    }

    public static $shift() {
        return '__shift__'
    }

    private shift(key: string) {
        let _item = this.getValue(key);
        _item.shift()
    }
}
