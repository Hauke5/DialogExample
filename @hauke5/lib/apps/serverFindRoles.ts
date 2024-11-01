'use server'
import path          from 'path';
import * as fs       from '@hauke5/lib/fileIO/server/fsUtil'
import { RoleDesc }  from '@hauke5/lib/apps/types';
import { DataRoot }  from '@hauke5/lib/fileIO/server/initializeDataRoot';


const roleFile = '.roles.json'


/** returns the contents of the `.role.json` file in the `data` root  */
export async function serverFindRoles():Promise<RoleDesc> {
   const file =  path.join(DataRoot, roleFile)
   if (fs.isFileSync(file)) {
      const roleDesc:RoleDesc = fs.readJsonFileSync<RoleDesc>(file)
      return roleDesc
   } else {
      return {
         public: 'Public'
      } as RoleDesc
   }
}
