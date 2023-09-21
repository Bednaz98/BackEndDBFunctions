import fs from 'fs-extra'

const jabDir = './node_modules/@jabz/'

const defaultRemove = [`generator client {\nprovider = "prisma-client-js"\n}`, `datasource db {\nprovider = "postgresql"\nurl      = env("DATABASE_URL")\n}`, `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema`];


const appendHeader = `generator client {
    provider = "prisma-client-js"
}

datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
}`


const editPrismaPath = './prisma/editSchema.prisma'
const defaultPrismaPath = './prisma/schema.prisma'

async function getPrismaFiles() {
    const directories: string[] = await fs.readdir(jabDir).catch(() => []).then((e) => e)
    return Promise.all(directories.map(async (m) => {
        try {
            const fileData = (await fs.readFile(jabDir + m + '/prisma/editSchema.prisma')).toString();
            console.log("File: ", m, "\n \t ", fileData)
            return fileData
        } catch (error) {
            return '';
        }
    }));

}

(async () => {
    const rawFiles = await getPrismaFiles()
    const editFiles = rawFiles
    const editScheme = (await fs.readFile(editPrismaPath)).toString()
    const fileArray = [appendHeader, editScheme, ...editFiles].map((e) => e.replace(defaultRemove[0], '').replace(defaultRemove[1], '').replace(defaultRemove[2], '').trim())
    const newFile = fileArray.filter((e) => e.length > 0).join('\n\n')
    await fs.writeFile(defaultPrismaPath, newFile);
})()