'use server';
import path from 'path';
import fs from '@hauke5/lib/fileIO/server/fsUtil';
import { AppsContext } from '@hauke5/lib/apps/AppsContext';
import { serverFindRoles } from '@hauke5/lib/apps/serverFindRoles';
import { Log } from '@hauke5/lib/utils';
import styles from '@/app/styles/App.module.scss';
import './styles/globals.scss';
export default async function RootLayout({ children }) {
    const appDescs = await serverFindApps();
    const roles = await serverFindRoles();
    return <html lang="en">
      <head />
      <body>
         <AppsContext appDescs={appDescs} roles={roles}><div className={styles.appRoot}>
            {children}
         </div></AppsContext>
      </body>
   </html>;
}
async function serverFindApps() {
    const log = Log('serverFindApps');
    const base = path.join(process.cwd(), `./app/`);
    const descPaths = findAppDescFiles(base);
    log.debug(`found ${descPaths.length} desc in main:\n   ${descPaths.join('\n   ')}`);
    try {
        const appDescs = descPaths.map(descPath => fs.readJsonFileSync(descPath));
        log.info(() => `loading ${appDescs.length} descriptors: \n   ${appDescs.map(d => JSON.stringify(d)).join(`\n   `)}`);
        return appDescs;
    }
    catch (e) {
        log.error(`reading appDesc: ${e}`);
        return [];
    }
    function findAppDescFiles(aPath) {
        const items = fs.readDirSync(aPath);
        const descs = items.filter(item => item === 'appDesc.json').map(item => path.join(aPath, item)).filter(item => fs.isFileSync(item));
        log.debug(`found ${descs.length} desc in '${aPath}':\n   ${descs.join('\n   ')}`);
        const dirs = (descs.length > 0) ? [] // dont' descend if we've found an appDesc
            : items.filter(item => fs.isDirectorySync(path.join(aPath, item)));
        const result = [...descs, ...dirs.flatMap(item => findAppDescFiles(path.join(aPath, item)))];
        return result;
    }
}
