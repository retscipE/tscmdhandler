# tscmdhandler
A command handler for Discord.JS made from Typescript.
```bash
npm install tscmdhandler
```

### To start using the handler, make your main bot file and import from Discord.JS and TSCmdHandler (I will show a Typescript example but you should be able to use Javascript as well)
```typescript
// ./index.ts
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "..", ".env") });

import { CommandClient } from 'tscmdhandler'
import { Client } from 'discord.js'
import categories from './commands'

const djsClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
    ]
})

const client = new CommandClient({
    client: djsClient,
    clientToken: process.env.TOKEN,
    localGuildId: "961227373649461248",
    ownerUserIds: ["544646066579046401"]
})

(async() => {
    await client.registerCategories(categories)
    await client.run()
})()

// ./commands/index.ts
import utility from './utility'

export default [
    utility
]

// ./commands/utility/index.ts
import { CommandCategory } from 'tscmdhandler'

import ping from './ping'
import test from './test'

const utility = new CommandCategory({
    name: "Utility",
    description: "Utility Commands",
});

utility
    .addCommand(ping)
    .addCommand(test)

export default utility

// ./commands/utility/ping.ts
import { createCommand } from 'tscmdhandler'
import { SlashCommandBuilder } from 'discord.js'

const meta = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!')

export default createCommand(meta, ({ interaction, client }) => {
    interaction.reply({ content: `Pong!` })
})

// ./commands/utility/test.ts
import { createCommand } from 'tscmdhandler'
import { SlashCommandBuilder } from 'discord.js'

const meta = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!')

export default createCommand(meta, ({ interaction, client }) => {
    interaction.reply({ content: `It works!` })
})
```

### You can do almost anything in the commands, this just shows how to setup the commands and use them. Also it is not required to make an event to process the commands as that has already been done within the package.