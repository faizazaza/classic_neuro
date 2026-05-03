//type template for messages to the server
export type GameMsg = {
    command: string,
    game: string,
    data?: ActionDataType | ContextDataType 
}

export type ServerMsg = {
    command: string,
    data?: { 
        [key: string]: any
    }
}

export enum CommandEnum {
    startup = "startup",
    context = "context",
    register = "actions/register",
    unregister = "actions/unregister",
    force = "actions/force",
    result = "action/result"
}

export type ActionDataType = {
    name: string,
    description: string,
    schema?: {
        type: "object",
        [key: string]: any
    }
}

export type ContextDataType = {
    message: string,
    silent: boolean
}