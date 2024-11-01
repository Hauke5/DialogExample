'use client'
import { createContext, useEffect, useState } 
                        from "react"
import { useSession }   from "next-auth/react"
import { useAppsContext, BaseProps, ALL_USERS, Role }           
                        from "@hauke5/lib/apps"
import { Log, generateUniqueBase64ID }                      
                        from "@hauke5/lib/utils"
import { dbGetUserByUsername, DBUser } 
                        from "./authDB"

const log = Log(`AuthContext`)

export type AuthContext = {
   user:       DBUser
   role:       Role
   status:     "authenticated" | "loading" | "unauthenticated"
}

const PublicUser:DBUser = {
   username:      ALL_USERS,
   displayName:   'Public',
   email:         '',
   id:            generateUniqueBase64ID(ALL_USERS),
}


export const authContext = createContext<AuthContext|null>(null)

export function AuthContext({children}:BaseProps) {
   const {roles}           = useAppsContext()
   const {data, status }   = useSession()
   const username = data?.user?.name ?? ALL_USERS
   const [user, setUser]   = useState<DBUser>(PublicUser)
   const [role, setRole]   = useState<Role>(roles[username])
   useEffect(()=>{
      if (username)
         dbGetUserByUsername(username)
            .then(registration => {
               log.debug(`user registered ${registration?.user.username}`)
               if (registration?.user) {
                  setUser(registration.user)
                  setRole(roles[registration.user.username])
               }
            })
   },[username, roles])
   return <authContext.Provider value={{user, role, status}}>
      {children}
   </authContext.Provider>
}