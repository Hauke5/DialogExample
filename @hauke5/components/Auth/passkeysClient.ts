import { OpenDialog }   from "@hauke5/components/Dialog"
import { base64ToBytes, bytesToBase64, Log } 
                        from "@hauke5/lib/utils"
import type { DBUser }  from "./authDB"
import { finalizeSignup, initAuth, initSignup, verifyAuth } 
                        from "./passkeysServer"

const log = Log('passKeyClient')

/**
 * Sign-up function
 * - opens a dialog to collect the user's details
 * - collects the biometric credentials from the user
 * - and registers the user's details under the provided name in the server DB
 * @param email 
 * @param openDialog 
 * @returns 
 */
export async function signUp(username:string, openDialog:OpenDialog) {
   try {
      // 1. Get the `InitSignup` structure for `name` from the server:
      const init = await initSignup(username)
      log(`signUp on host ${init.publicKey.rp.id}`)
      const publicKey = init.publicKey

      const challenge = publicKey.challenge = Uint8Array.from(publicKey.challenge as unknown as number[])
      publicKey.user.id = Uint8Array.from(init.publicKey.user.id as unknown as number[])
      
      const user:DBUser = {
         username,
         id:            bytesToBase64(publicKey.user.id as Uint8Array),
         displayName:   init.publicKey.user.displayName,
         email:         ''
      }

      // 2. Get profile details from user
      const details = await openDialog({
         title: `New User Signup:`,
         items:[
            {id:'Name',        type:'text', initial:user.username,  label: 'Username:', disable:()=>true },
            {id:'Email',       type:'text', initial:user.email, label:'Email'},
            {id:'DisplayName', type:'text', initial:user.displayName,  label: 'Display Name:' },
         ],
         buttons:[
            {id:'Register'}
         ]
      })
      if (details.actionName !== 'Register') {
         log.warn(`signup dialog canceled`)
         return false
      }
      user.email        = details.items.Email.value as string
      user.displayName  = details.items.DisplayName.value as string

      // 3. Collect user biometrics for registration
      const data   = await navigator.credentials.create({ publicKey }) as PublicKeyCredential
      const rawArr = new Uint8Array(data.rawId)
      const passId = bytesToBase64(rawArr)
      const _b64   = base64ToBytes(passId)
      log.debug(`signUp ids:\n       raw='${rawArr}'\n   data.id='${data.id}'\n    passId='${passId}'\n    buffer='${_b64}'`)

      // 4. Send everything to server to complete the registration
      const signedUp = await finalizeSignup({ user, passId, challenge })
      log.debug(`user '${user.username} (${user.email})' signed up`)
      return signedUp
   } catch(e) {
      log.error(`signup: ${e}`)
      alert(`signUp: ${e}`)
   }
   return false
}


/**
 * client-side passkey login
 * - gets the allowed credentials from the server
 * - collects the biometric credentials from the user
 * - and verifies if everything matches 
 * @param username 
 * @return the `DBUser` if successful, else
 * - `-1` if no record exists and user needs to sign up
 * - `-2` if data could not be verified
 * @throws Error if an error occurred
 */
export async function login(username:string):Promise<DBUser|number> {
   try {
      // 1. get the allowed credentials from the server 
      const init = await initAuth(username)
      if (init===null) {
         log.warn(`unknown name '${username}'`)
         alert(`login: unknown name '${username}'`)
         return -1
      }
      const passIds = init.allowedPassIds
      log.debug(`login id = ['${passIds.join(',')}']`)
      const allowCredentials:PublicKeyCredentialDescriptor[] = passIds.map(cr => ({
         id: base64ToBytes(cr),
         type: "public-key"
      }))
      log.debug(`login ids:\n   passIds='${passIds.join(',')}'\n   cred.id='${allowCredentials.map(cr => cr.id).join(',')}'`)

      // 2. collect the biometric credentials
      log(`collecting biometrics`)
      const challenge = Uint8Array.from(init.challenge as unknown as number[])
      const options:CredentialRequestOptions = {
         publicKey: {
            challenge,
            allowCredentials,
         }
      }
      const rawCreds:Credential|null = await navigator.credentials.get(options)
      if (!rawCreds) {
         log.error(`getting navigator credentials`)
         alert(`login: error getting navigator credentials`)
         throw Error(`getting navigator credentials`)
      }
      const credential:Credential = {
         id:   rawCreds.id,
         type: rawCreds.type
      }
      // 3. verify that everything matches and get the user info from the server
      log.debug(`verifying user`)
      const user = await verifyAuth({username, credential, challenge})
      if (!user) {
         log.error(`verifying biometrics for ${username}`)
         return -2
      }
      log.debug(`user '${user.username} (${user.email})' verified`)
      return user
   } catch(e) {
      log.error(`logging in user for ${username}: ${e}`)
      alert(`login: ${e}`)
      throw Error(`logging in user for ${username}: ${e}`)
   }
}
