import { Client, SlashCommandBuilder } from 'discord.js'
import { CommandCategory, CommandClient, createCommand } from '../src'

const djsClient = new Client({
    intents: []
})

const client = new CommandClient({
    discordClient: djsClient,
    clientToken: "eefgrefewfw",
    localGuildId: "12323354354325",
    ownerUserIds: ["12345678910"]
})

const test = new CommandCategory({
    name: "Test",
    description: "Test description"
})

const meta = new SlashCommandBuilder()
    .setName("test")
    .setDescription("test")

const cmd = createCommand(
    meta,
    ({ interaction, client }) => {
        interaction.reply({ content: `Pong! ${client.ws.ping}ms.` })
    },
    ["Administrator"]
)

test
    .addCommand(cmd)


client.registerCategories([
    test
], false)