import { Services } from "./services/base.ts";

type ServiceName=keyof typeof Services;

type NovelData = {
    services:{name:ServiceName,config:Record<string,string>}[];
    langs:{
        langCode:string;
        telegramId:string;
        chapters:{
            createdAt:Date;
            paragraphs:{
                telegramId:string;
                updatedAt:Date;
                content:string;
                history:{createdAt:Date,content:string}[];
            }[];
        }[];
     
        titles:string[];
    }[];

}


export class Novel {

    public Data:NovelData|undefined;

    public async TryUpdate(){
        //miro si hay un servicio disponible
        //miro si hay nuevos capitulos
        //actualizo el json
        //publico en los canales (ORI,ESP,CAT)
        //si hay algun error lo pongo en el LOG
        //si no hay servicio disponible para continuar lo digo en el LOG
    }




    public static GetAll():Novel[]{
        return [];
    }
    
}



