'use client';
import { createContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useAppsContext, ALL_USERS } from "@hauke5/lib/apps";
import { Log, generateUniqueBase64ID } from "@hauke5/lib/utils";
import { dbGetUserByUsername } from "./authDB";
const log = Log(`AuthContext`);
const PublicUser = {
    username: ALL_USERS,
    displayName: 'Public',
    email: '',
    id: generateUniqueBase64ID(ALL_USERS),
};
export const authContext = createContext(null);
export function AuthContext({ children }) {
    const { roles } = useAppsContext();
    const { data, status } = useSession();
    const username = data?.user?.name ?? ALL_USERS;
    const [user, setUser] = useState(PublicUser);
    const [role, setRole] = useState(roles[username]);
    useEffect(() => {
        if (username)
            dbGetUserByUsername(username)
                .then(registration => {
                log.debug(`user registered ${registration?.user.username}`);
                if (registration?.user) {
                    setUser(registration.user);
                    setRole(roles[registration.user.username]);
                }
            });
    }, [username, roles]);
    return <authContext.Provider value={{ user, role, status }}>
      {children}
   </authContext.Provider>;
}
