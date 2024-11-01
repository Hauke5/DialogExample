import { getServerSession } from "next-auth";
import { Log } from "@hauke5/lib/utils";
import { serverFindRoles } from "@hauke5/lib/apps/serverFindRoles";
import { ALL_USERS } from "@hauke5/lib/apps/types";
import { authOptions } from "./authOptions";
const log = Log(`checkPermission`);
/**
 * checks the permissions of the currently logged in user against
 * the provided `allowedRoles`
 * @param allowedRoles
 */
export async function checkAllowedRoles(allowedRoles) {
    const session = await getServerSession(authOptions);
    const roles = await serverFindRoles();
    const user = session?.user?.name ?? ALL_USERS;
    const hasPermission = allowedRoles.includes(roles[user]);
    if (hasPermission) {
        log.debug(`permissions for ${user}: ${roles[user]}, has one of the requested permission [${allowedRoles.join(', ')}]`);
        return {
            user,
            requested: allowedRoles,
            fulfilled: true,
        };
    }
    else {
        log.warn(`permissions for ${user}: ${roles[user]}, has none of the requested permissions [${allowedRoles.join(', ')}]`);
        return {
            user,
            requested: allowedRoles,
            fulfilled: false,
        };
    }
}
