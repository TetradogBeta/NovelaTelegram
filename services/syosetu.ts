import { Base,ServiceConfig } from "./base.ts";




export class Syosetu extends Base{


    public override get Config():ServiceConfig {
      return {
        langCode:'ja',
        isCompatible:/^https?:\/\/ncode\.syosetu\.com\/n[a-z0-9]+\/\d+\/?$/,
      };
    }

    public override async IsAvailable(url: string): Promise<boolean> {
        return true;
    }




}


export default new Syosetu();