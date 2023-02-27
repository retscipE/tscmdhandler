import { Awaitable, ChatInputCommandInteraction, Client, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js"

export interface CommandProps {
    interaction: ChatInputCommandInteraction
    client: Client
}
  
export type CommandExec =
    (props: CommandProps) => Awaitable<unknown>
export type CommandMeta =
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
    | SlashCommandSubcommandsOnlyBuilder
export interface Command {
    meta: CommandMeta
    exec: CommandExec
    cooldown?: number
    ownerOnly?: boolean
}