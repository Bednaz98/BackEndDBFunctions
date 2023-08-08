import fs from "fs-extra";

const replaceString = `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`;


const { dirname } = require('path');
const appDir = dirname(require?.main?.filename);
const readFile = `${appDir}/../prisma/schema.prisma`;
const writePath = `${appDir}/../prisma/syncSchema.txt`;

(async () => {
    const text = (await fs.readFile(readFile)).toString();
    await fs.writeFile(writePath, text.replace(replaceString, ""))
})();