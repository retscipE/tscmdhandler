import mongoose from "mongoose";
import { MongoSchema } from "../types";

export class MongoClient {
    #uri: string;
    #connection: mongoose.Connection;

    constructor(options: {
        uri: string,
    }) {
        if (/^(mongodb:(?:\/{2})?)((\w+?):(\w+?)@)?((\w+?)(?::(\d+?))?)\/(\w+?)$/.test(options.uri)) this.#uri = options.uri;
        else throw new Error("Invalid MongoDB URI provided.")

        mongoose.connect(options.uri)
        this.#connection = mongoose.connection;
    }

    public async initialize() : Promise<void> {
        return new Promise((resolve, reject) => {
            this.#connection.on("error", (err) => {
                reject(err);
            });

            this.#connection.once("open", () => {
                resolve();
            });
        });
    }
    
    public get uri() : string {
        return this.#uri;
    }

    public get connection() : mongoose.Connection {
        return this.#connection;
    }

    public get db() : mongoose.mongo.Db {
        return this.#connection.db;
    }

    public createSchema(name: string, schemaObj: mongoose.Schema) : MongoSchema {
        return {
            name,
            schemaObj
        }
    }

    public async registerSchemas(schemas: MongoSchema[]) : Promise<MongoSchema[]> {
        schemas.forEach((schema) => {
            this.#connection.model(schema.name, schema.schemaObj, schema.name);
        });

        return schemas;
    }
}