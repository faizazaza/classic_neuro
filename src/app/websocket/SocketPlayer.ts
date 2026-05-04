import { GameMsg } from "../types/ActionTypes";

export class SocketPlayer {

    private wbs!: WebSocket
    private name: string
    private player: number

    public onSocketMsg?: () => void;


    constructor(url: string, name: string, player: number, onSocketMsg: (socketMsg: string) => void){
        this.name = name;
        this.startWebsocket(url)
        this.player = player;
        this.onSocketMsg = () => {onSocketMsg}
    }

    public startWebsocket = (url: string) => {
        //should move this outside
        if (!url) {
            console.error("ERROR: No Websocket Url Given. Application cancelled");
            return;
        }
        const socket = new WebSocket(url);

        this.wbs = socket;

        socket.onopen = () => {
            console.log(`Player ${this.player} connected to Websocket. Name: ${this.name}`);
            const msg = {
                //init msg here
            }
            socket.send(JSON.stringify(msg))
        };

        socket.onerror = (event: Event) => {
            console.error("WebSocket error occurred:", event);
        };

        //recieves all of the inputs
        socket.onmessage = (event) => {
            

        }
        
    }

    public closeConnection(){
        this.wbs.close();
    }

    public sendGameMsg(msg: GameMsg) {
        this.wbs.send(JSON.stringify(msg))
    }

}