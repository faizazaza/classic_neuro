
export class SocketPlayer {

    private wbs!: WebSocket
    private name: string
    private player: number

    constructor(url: string, name: string, player: number){
        this.name = name;
        this.startWebsocket(url)
        this.player = player;
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
            //typing needed here for response probably
            const msg = JSON.parse(event.data);

            switch (msg) {
                case "something":
                break;

                case "something else":
                break;

                case "end":
                    this.closeConnection()
                break;
            
                default:
                    //return unhandled exeption
                    console.log("fell to default")
                    //probably not safe to do this,,,, remove
                    console.log(msg)
                break;
            }

        }
        
    }

    private closeConnection(){
        this.wbs.close();
    }


}