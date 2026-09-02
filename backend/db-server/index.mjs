import { MongoMemoryServer } from "mongodb-memory-server";
import fs from "fs";

(async () => {
  try {
    const mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017
      }
    });
    const uri = mongod.getUri();
    console.log("Memory MongoDB started at:", uri);
    fs.writeFileSync("mock-db-uri.txt", uri);
  } catch (err) {
    console.error("Failed to start MongoMemoryServer:", err);
  }
})();
