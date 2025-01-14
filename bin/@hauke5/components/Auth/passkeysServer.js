'use server';
import { Log } from "@hauke5/lib/utils";
import { dbGetUserByUsername, dbSetUserByUsername } from "./authDB";
import { base64ToBytes, bytesToBase64, generateUniqueBase64ID } from "@hauke5/lib/utils";
const log = Log(`passkeysServer`);
const RP_ID = "Helpful Scripts";
/**
 * Generates and returns
 * - the user info: either an existing record for `name`, or a newly initialized one with
 * an empty email and displayName
 * - the `PublicKeyCredentialCreationOptions`
 */
export async function initSignup(username) {
    const registration = (await dbGetUserByUsername(username));
    const user = registration?.user ?? {
        id: generateUniqueBase64ID(username),
        username,
        email: '',
        displayName: '',
    };
    log(`initSignup '${username}'`);
    const challenge = generateChallenge();
    openChallenge(challenge, username);
    const host = 'localhost'; // os.hostname()
    return {
        publicKey: {
            rp: { name: 'Helpful Scripts', id: host },
            challenge,
            user: {
                id: base64ToBytes(user.id), // we transfer a Uint8Array
                name: user.username,
                displayName: '',
            },
            pubKeyCredParams: [
                { type: 'public-key', alg: -7 },
                { type: 'public-key', alg: -8 },
                { type: 'public-key', alg: -257 },
            ]
        }
    };
}
/**
 * registers user in the DB:
 * @param signUpResult
 * @returns `true` if the registration was successful, else `false
 */
export async function finalizeSignup({ challenge, user, passId }) {
    challenge = new Uint8Array(challenge);
    const username = closeChallenge(challenge);
    if (!username) {
        log.error(`no matching challenge found for '${challenge}'`);
        return false;
    }
    if (username !== user.username) {
        log.error(`names don't match ('${user.username}' vs '${username}') for challenge '${challenge}'`);
        return false;
    }
    log(`completing registration with passId '${passId}':`, user);
    dbSetUserByUsername(user, passId);
    return true;
}
/**
 * start the authentication step:
 * - create and return an `options` object with a challenge
 */
export async function initAuth(username) {
    const registration = await dbGetUserByUsername(username);
    if (registration == null)
        return null;
    log(`initAuth for '${registration.user.username} (${username})'`);
    const challenge = generateChallenge();
    openChallenge(challenge, username);
    const options = {
        rp: RP_ID,
        allowedPassIds: registration.passIds,
        challenge,
        pubKeyCredParams: [
            { type: 'public-key', alg: -7 },
            { type: 'public-key', alg: -8 },
            { type: 'public-key', alg: -257 },
        ]
    };
    return options;
}
/**  */
export async function verifyAuth({ username, credential, challenge }) {
    const registration = await dbGetUserByUsername(username);
    log(`verifying authentication for ${username}`, credential, registration);
    const challengeMatch = closeChallenge(Uint8Array.from(challenge));
    if (!challengeMatch) {
        log.error(`verifyAuth: no matching challenge found`);
        return null;
    }
    if (!registration?.passIds.find(id => id.indexOf(credential.id) >= 0)) {
        const parts = RegExp(/([a-zA-Z0-9]+)/).exec(credential.id);
        log.error(`verifyAuth: no id match found for '${credential.id}':`, registration?.passIds);
        log.error(parts);
        if (!registration?.passIds.some(pass => {
            parts?.every(part => pass.indexOf(part) >= 0);
        }))
            return null;
    }
    if (username !== registration.user.username) {
        log.error(`verifyAuth: mismatching names: expected ${registration.user.username}, found ${username}`);
        return null;
    }
    // evertyhing looks good, return user profile
    log.info(`verified '${registration.user.username} (${registration.user.email})'`);
    return registration.user;
}
//--------------------------------
/** contains currently active challenges and their linked names */
const pendingChallenges = {};
/**  */
function openChallenge(challenge, username) {
    const challengeString = bytesToBase64(challenge);
    if (pendingChallenges[challengeString]) {
        log.error(`challenge '${challengeString}' already exists for '${username}'`);
        return;
    }
    pendingChallenges[challengeString] = username;
}
function closeChallenge(challenge) {
    const challengeString = bytesToBase64(challenge);
    const username = pendingChallenges[challengeString];
    if (!username) {
        log.error(`challenge ${challengeString} not found`);
        return null;
    }
    delete pendingChallenges[challengeString];
    return username;
}
function generateChallenge() {
    const challenge = new Uint8Array(32);
    globalThis.crypto.getRandomValues(challenge);
    return challenge;
}
