import { useContext } from "react";
import { authContext } from "./AuthContext";
/**
 * provides the name of the user currently authorized via next-auth,
 * or ALL_USERS if no one is logged in
 */
export function useAuthContext() {
    const context = useContext(authContext);
    if (!context)
        throw Error(`useAuthContext is called outside the context`);
    return context;
}
