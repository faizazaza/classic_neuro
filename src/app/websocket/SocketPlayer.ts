import { GameMsg, ServerMsg } from "../types/ActionTypes";

export class SocketPlayer {

    private wbs!: WebSocket
    private playerName: string
    private playerId: number

    public onSocketMsg!: (msg: ServerMsg, playerId: number, playerName: string) => void;


    constructor(url: string, name: string, player: number, onSocketMsg: (msg: ServerMsg, playerId: number, playerName: string) => void){
        this.playerName = name;
        this.startWebsocket(url)
        this.playerId = player;
        this.onSocketMsg = (msg: ServerMsg, playerId: number, playerName: string) => {onSocketMsg(msg, playerId, playerName)}
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
            console.log(`Player ${this.playerId} connected to Websocket. Name: ${this.playerName}`);
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
            const msg: ServerMsg = JSON.parse(event.data);  
            //this is blind faith that ill be sent something that will fit this, #
            // but it doesnt i need to be able to send an action id to stay that its bad,,, 
            // which i can't guarantee would be there?
            
            //ALSO SEND PLAYER NUMBER & NAME TO THE GAME
            this.onSocketMsg(msg, this.playerId, this.playerName)
        }
        
    }

    public closeConnection(){
        this.wbs.close();
    }

    public sendGameMsg(msg: GameMsg) {
        this.wbs.send(JSON.stringify(msg))
    }

}