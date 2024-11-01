'use client';
import { Fragment, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { Log } from "@hauke5/lib/utils";
import { Dialog } from "@hauke5/components/Dialog";
import styles from './signin.module.scss';
import { login, signUp } from "./passkeysClient";
const log = Log(`signin.page`);
const Forms = {
    Credentials: CredentialsForm,
    Passkeys: PasskeysForm
};
export const providers = [
    { name: 'Passkeys', id: 'passkeys' },
    { name: 'Credentials', id: 'credentials' },
    { name: 'Auth0', id: 'auth0' },
];
export function SignInPage({ callbackUrl, error }) {
    log.debug(`SignInPage: ${callbackUrl}, ${error ? `error='${error}'` : ''}`);
    return <div className={styles.signin}>
      {error && <div className={styles.error}>{`Error signing in with ${error}`}</div>}
      {Object.values(providers).map((provider, i) => {
            const Form = Forms[provider.name] ?? OtherProviderForm;
            return <Fragment key={provider.id}>
            {i > 0 && <hr />}
            <Form provider={provider} callbackUrl={callbackUrl ?? '/'}/>
         </Fragment>;
        })}
      <div className={styles.callbackUrl}>{`redirecting to: ${callbackUrl}`}</div>
   </div>;
}
function PasskeysForm({ provider, callbackUrl }) {
    const openDialog = useRef();
    return <>
      <form action={passkeysSubmit} className={styles.provider}>
         <label htmlFor="email">
            Username
            <input name="name" id="name"/>
         </label>
         <input type="submit" value={`Sign In with ${provider.name}`}/>
      </form>
      <Dialog open={open => openDialog.current = open}/>
   </>;
    async function passkeysSubmit(formData) {
        let isSignedup = false;
        try {
            const name = formData.get('name');
            if (name.length === 0)
                return;
            let user;
            do {
                user = await login(name);
                if (user === -1) {
                    if (!isSignedup) {
                        const registration = await signUp(name, openDialog.current);
                        log(`signup result: ${registration ? 'success' : 'failure'}`);
                        if (!registration)
                            return;
                        isSignedup = true;
                    }
                    else {
                        log.error(`user is signed up but authorization failed`);
                        return;
                    }
                }
            } while (user === -1);
            if (typeof user !== 'object') {
                log.error(`unexpected user value ${user}`);
                return;
            }
            // user is now authenticated
            log(`user ${user.username} (${user.email}) is now logged in for ${callbackUrl}`);
            await signIn('passkeys', { email: user.email, name: user.username, callbackUrl });
        }
        catch (error) {
            log.error(`in form: ${error}`);
            alert(error);
        }
    }
}
function CredentialsForm({ provider, callbackUrl }) {
    const [login, setLogin] = useState({ username: '', password: '' });
    return <form action={credentialsSubmit} className={styles.provider}>
      <label htmlFor="username">
         Username
         <input name="username" id="username" onChange={handleChange} value={login.username}/>
      </label>
      <label htmlFor="password">
         Password
         <input name="password" id="password" onChange={handleChange} value={login.password}/>
      </label>
      <input type="submit" value={`Sign In with ${provider.name}`}/>
   </form>;
    function handleChange(e) {
        setLogin({
            ...login,
            [e.target.name]: e.target.value,
        });
    }
    async function credentialsSubmit(formData) {
        const username = formData.get('username');
        const password = formData.get('password');
        try {
            const result = await signIn('credentials', { username, password, callbackUrl });
            log(`credentialsSubmit: ${result}`);
        }
        catch (e) {
            log.error(`credentialsSubmit: ${e}`);
        }
    }
}
function OtherProviderForm({ provider, callbackUrl }) {
    return <form action={otherSubmit} className={styles.provider}>
      <button type="submit" style={{ backgroundColor: provider.style?.bg }}>
         <span>Sign in with {provider.name ?? provider.name}</span>
      </button>
   </form>;
    function otherSubmit() {
        signIn(provider.id, { callbackUrl });
    }
}
