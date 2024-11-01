'use server';
import path from "path";
import { readJsonFile, writeJsonFile } from "@hauke5/lib/fileIO/server/fsUtil";
import { Log } from "@hauke5/lib/utils";
const log = Log(`authDB`);
const CredentialFile = path.join(process.cwd(), 'data/.credentialsDB.json');
export async function dbGetUserByUsername(username) {
    const users = await readUsers();
    log(`get user '${username}': ${users[username] ? 'found' : 'not found'}`);
    return users[username] ?? null;
}
export async function dbSetUserByUsername(user, passId) {
    const users = await readUsers();
    const name = user.username;
    if (!users[name])
        users[name] = { user, passIds: [] };
    if (!users[name].passIds.includes(passId))
        users[name].passIds.push(passId);
    writeUsers(users);
}
async function readUsers() {
    try {
        const users = await readJsonFile(CredentialFile);
        log.debug(`reading users:`, users);
        return users;
    }
    catch (e) {
        // no credential file yet
        return {};
    }
}
async function writeUsers(users) {
    await writeJsonFile(CredentialFile, users);
    log(`updated users`);
}
