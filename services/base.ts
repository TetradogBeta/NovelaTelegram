

export enum Services{
    Syosetu
}

export type ServiceConfig={
     langCode:string;
     isCompatible:RegExp;
};

export abstract class Base{
    public  IsCompatible(url:string):boolean{
        const {isCompatible}=this.Config;
        return isCompatible.test(url);
    }
    public abstract get Config():ServiceConfig;
    public abstract IsAvailable(url:string):Promise<boolean>;
}