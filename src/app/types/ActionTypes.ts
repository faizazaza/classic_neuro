//type template for messages to the server
export type GameMsg = {
  [K in keyof CommandDataMap]:
    CommandDataMap[K] extends never
      ? { command: K; game: string }
      : { command: K; game: string; data: CommandDataMap[K] }
}[keyof CommandDataMap]

export type ServerMsg = {
    command: "action",
    data: { 
        id: string,
        name: string,
        data?: string
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

type CommandDataMap = {
  [CommandEnum.context]: ContextDataType
  [CommandEnum.register]: RegisterDataType
  [CommandEnum.unregister]: UnregisterDataType
  [CommandEnum.force]: ForceDataType
  [CommandEnum.result]: ResultType
  [CommandEnum.startup]: never
}

export type ActionType = {
    name: string,
    description: string,
    schema?: unknown    //ew
}

export type ContextDataType = {
    message: string,
    silent: boolean
}

export type RegisterDataType = {
    actions: ActionType[]
}

export type UnregisterDataType = {
    action_names: string[]
}

export type ForceDataType = {
    state?: string,
    query: string,
    ephemeral_context?: boolean, // Defaults to false
    priority: priorityEnum, // Defaults to "low"
    action_names: string[]
}

export enum priorityEnum {
    low = "low",
    medium = "medium",
    high = "high",
    critical = "critical"
}

export type ResultType = {
    id: string,
    success: boolean,
    message?: string
}
