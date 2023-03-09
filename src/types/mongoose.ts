import mongoose from "mongoose";

export interface MongoSchema {
    name: string;
    schemaObj: mongoose.Schema
}