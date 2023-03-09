import { Client, SlashCommandBuilder } from 'discord.js'
import mongoose from 'mongoose'
import { CommandCategory, CommandClient, createCommand, MongoClient } from '../src'

const djsClient = new Client({
    intents: []
})

const mongoClient = new MongoClient({
    uri: "mongodb://localhost:27017"
})

const client = new CommandClient({
    djsClient,
    clientToken: "eefgrefewfw",
    localGuildId: "12323354354325",
    ownerUserIds: ["12345678910"],
    mongoClient
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
    .addCommand(cmd);


(async () => {
    await client
        .registerCategories([
            test
        ], false);
    await client.run();
    await mongoClient.registerSchemas([
        mongoClient.createSchema("test", new mongoose.Schema({
            name: String,
            age: Number
        }))
    ])
    await mongoClient.initialize();
})();