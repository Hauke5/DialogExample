'use server'
import path                   from 'path';
import fs                     from 'lib/fileIO/fsUtil'
import { AppsContext }        from 'lib/apps/AppsContext';
import { ChildrenOnlyProps }  from 'components/BaseProps'
import { AppDesc }            from 'lib/apps';
import { serverFindRoles }    from 'lib/apps/serverFindRoles';
import { RoleDesc }           from 'lib/apps/types';
import { Log }                from 'lib/utils';
import styles                 from '@/app/styles/App.module.scss'
import                             './styles/globals.scss'

export interface LayoutProps extends ChildrenOnlyProps {
}

export default async function RootLayout({children}: LayoutProps) {
   const appDescs = await serverFindApps()
   const roles:RoleDesc = await serverFindRoles()

   return <html lang="en">
      <head />
      <body>
         <AppsContext appDescs={appDescs} roles={roles}><div className={styles.appRoot}>
            {children}
         </div></AppsContext>
      </body>
   </html>
}

async function serverFindApps():Promise<AppDesc[]> {
   const log = Log('serverFindApps')
   const base = path.join(process.cwd(),`./app/`)
   const descPaths = findAppDescFiles(base)
   log.debug(`found ${descPaths.length} desc in main:\n   ${descPaths.join('\n   ')}`)
   try {
      const appDescs:AppDesc[] = descPaths.map(descPath => fs.readJsonFileSync<AppDesc>(descPath))
      log.info(()=>`loading ${appDescs.length} descriptors: \n   ${appDescs.map(d => JSON.stringify(d)).join(`\n   `)}`)
      return appDescs
   } catch(e) {
      log.error(`reading appDesc: ${e}`)
      return []
   }

   function findAppDescFiles(aPath:string):string[] {
      const items = fs.readDirSync(aPath)
      const descs = items.filter(item => item==='appDesc.json').map(item => path.join(aPath, item)).filter(item => fs.isFileSync(item))
      log.debug(`found ${descs.length} desc in '${aPath}':\n   ${descs.join('\n   ')}`)
      const dirs = (descs.length>0)? []   // dont' descend if we've found an appDesc
         : items.filter(item => fs.isDirectorySync(path.join(aPath, item)))
      const result:string[] = [...descs, ...dirs.flatMap(item => findAppDescFiles(path.join(aPath, item)))]
      return result
   }
}