import { CommandEnum, GameMsg, ServerMsg } from "../types/ActionTypes";

export class SocketPlayer {

    private wbs!: WebSocket
    private playerName: string
    private playerId: number

    public onSocketMsg!: (msg: ServerMsg, playerId: number, playerName: string) => void;
    private onSocketConnection: (id: number) => void;

    constructor(
        url: string, 
        name: string, 
        player: number, 
        onSocketMsg: (msg: ServerMsg, playerId: number, playerName: string) => void,
        onSocketConnection: (id: number) => void
    ){
        this.playerName = name;
        this.startWebsocket(url)
        this.playerId = player;
        this.onSocketMsg = (msg: ServerMsg, playerId: number, playerName: string) => {onSocketMsg(msg, playerId, playerName)}
        this.onSocketConnection = onSocketConnection;
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
            const msg: GameMsg = {
                command: CommandEnum.startup,
                game: "Menu"
            }
            console.log(msg)
            this.sendGameMsg(msg);
            this.onSocketConnection(this.playerId);
        };

        socket.onerror = (event: Event) => {
            console.error("WebSocket error occurred:", event);
        };

        //recieves all of the inputs
        socket.onmessage = (event) => {
            console.log(`Message received from Player ${this.playerId} Name: ${this.playerName}`);
            const msg: ServerMsg = JSON.parse(event.data);  
            //this is blind faith that ill be sent something that will fit this
            
            //ALSO SEND PLAYER NUMBER & NAME TO THE GAME
            this.onSocketMsg(msg, this.playerId, this.playerName)
        }
        
    }

    public closeConnection(){
        this.wbs.close();
    }

    public sendGameMsg(msg: GameMsg) {
        console.log(`sendGameMsg for ${this.playerId}  Name: ${this.playerName}`)
        this.wbs.send(JSON.stringify(msg))
    }

}