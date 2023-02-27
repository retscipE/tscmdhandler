import { Client, REST, Routes, APIUser, Collection } from "discord.js";
import { Command, CommandMeta, CommandExec } from "../types";
import ms from 'ms'

export class CommandClient {
    #client: Client;
    #clientToken: string;
    #localGuildId: string;
    #ownerUserIds: string[];
    #cooldown = new Collection<string, number>();
    #commandsMap = new Map<string, Command>();
    
    constructor(options: {
        discordClient: Client,
        clientToken: string,
        localGuildId: string
        ownerUserIds: string[]
    }) {
        this.#client = options.discordClient;
        this.#localGuildId = options.localGuildId;
        this.#clientToken = options.clientToken;
        this.#ownerUserIds = options.ownerUserIds;
    }

    /**
     * Gets the Discord Client instance.
     */
    public get discordClient() : Client {
        return this.#client
    }

    public async run() {
        this.#client.on("interactionCreate", async (interaction) => {
            if (!interaction.isChatInputCommand()) return;

            try {
                const cmdName = interaction.commandName;
                const command = this.#commandsMap.get(cmdName);

                if (!command) throw new Error("Command not found.")

                if (command.ownerOnly === true && !this.#ownerUserIds.includes(interaction.user.id)) {
                    interaction.reply({
                        content: "Only the bot owners can use this command.",
                        ephemeral: true,
                    });
                } else {
                    if (command.cooldown) {
                        if (this.#cooldown.has(`${interaction.user.id}-${interaction.commandName}`)) {
                            interaction.reply({ 
                                content: `You are on cooldown for this command! ` + ms(this.#cooldown.get(`${interaction.user.id}-${interaction.commandName}`)! - Date.now(), { long: true }) + " left.",
                                ephemeral: true
                            })
                            return
                        }

                        await command.exec({
                            client: this.#client,
                            interaction
                        })

                        this.#cooldown.set(`${interaction.user.id}-${interaction.commandName}`, Date.now() + command.cooldown)
                        setTimeout(() => {
                            this.#cooldown.delete(`${interaction.user.id}-${interaction.commandName}`)
                        }, command.cooldown)
                    } else {
                        await command.exec({
                            client: this.#client,
                            interaction,
                        })
                    }
                }
                
            } catch (e) {
                console.error('[Command Error] ', e)
                if (interaction.deferred)
                    interaction.editReply("Something went wrong! Please try again later. ❌")
                else 
                    interaction.reply("Something went wrong! Please try again later. ❌")
            }
        })

        this.#client.login(this.#clientToken);
    }

    /**
     * Registers the commands and categories passed in to the Discord API.
     * @param categories 
     * @param global 
     */
    public async registerCategories(categories: CommandCategory[], global: boolean): Promise<CommandCategory[]> {
        const body = categories.map(({ commands }) => {
            commands.map(({ meta }) => meta)
        }).flat();
        const allCommands = categories.map(({ commands }) => commands).flat();
        this.#commandsMap = new Map<string, Command>(
            allCommands.map((c) => [c.meta.name, c])
        )

        const rest = new REST({ version: '10' }).setToken(this.#clientToken);

        (async () => {
            const currentUser = await rest.get(Routes.user()) as APIUser

            const endpoint = global === true
                ? Routes.applicationCommands(currentUser.id)
                : Routes.applicationGuildCommands(currentUser.id, this.#localGuildId)

            rest.put(endpoint, { body: [] })
                .catch(console.error);

            await rest.put(endpoint, { body })

            return currentUser
        })()
        .then((user) => {
            const response = global === true
                ? `Successfully registered commands and categories globally with ${user.username}#${user.discriminator} (${user.id})`
                : `Successfully registered commands and categories locally with ${user.username}#${user.discriminator} (${user.id}) in guild: ${this.#localGuildId}`

            console.log(`[TS Command Handler] ${response}`)
        })

        return categories;
    }
}

export class CommandCategory {
    #name: string;
    #description: string;
    #commands: Command[] = [];
    
    constructor(options: {
        name: string,
        description: string
    }) {
        this.#name = options.name;
        this.#description = options.description
    }

    public get name() : string {
        return this.#name
    }

    public get description() : string {
        return this.#description
    }

    public get commands() : Command[] {
        return this.#commands
    }

    public addCommand(command: Command) : Command {
        try {
            this.#commands.push(command);
        } catch (e) {
            console.error(e)
        }

        return {
            meta: command.meta,
            exec: command.exec,
            cooldown: command.cooldown,
            ownerOnly: command.ownerOnly
        }
    }
}

export function createCommand(opts: {
    meta: CommandMeta,
    exec: CommandExec,
    cooldown?: number,
    ownerOnly?: boolean
}): Command {
    return {
        meta: opts.meta,
        exec: opts.exec,
        cooldown: opts.cooldown,
        ownerOnly: opts.ownerOnly
    }
}