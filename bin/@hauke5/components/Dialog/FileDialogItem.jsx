import { Fragment, useEffect, useRef, useState } from "react";
import { mdiFileDocumentOutline, mdiFolder } from "@mdi/js";
import { useAppDesc } from "@hauke5/lib/apps";
import { serverPathInfo } from "@hauke5/lib/fileIO/server/serverFileIO";
import { Scrollable } from "../Scrollable";
import { Icon } from "../Icon";
import styles from './Dialog.module.scss';
import { Dialog, addDialogItemHandler, doSideEffect } from "./Dialog";
export const DlgKeys = {
    ReplaceButton: 'Replace',
    FileSelect: 'fileSelect'
};
export const saveButton = 'Save';
addDialogItemHandler('file', FileDialogItem);
function FileDialogItem({ item, dialog, rerender, act: select }) {
    const { key: appKey } = useAppDesc();
    const [path, setPath] = useState(item.initial ?? '');
    const [dirItems, setDirItems] = useState([]);
    const [selected, setSelected] = useState(null); //used for style effect only
    const openDialog = useRef();
    useEffect(() => {
        const list = item.list
            ? typeof item.list === 'function'
                ? item.list()
                : item.list
            : [];
        getFolderItems(path).then(info => {
            if (info)
                setDirItems([
                    ...info.dirList.map(d => ({ name: d, type: 'dir' })),
                    ...info.fileList.filter(f => {
                        // if hidden file -> reject
                        if (f[0] === '.')
                            return false;
                        // if no extensions defined, allow all files
                        if (list.length === 0)
                            return true;
                        // else, if file has no extension: reject
                        const lastPeriod = f.lastIndexOf('.');
                        if (lastPeriod < 0)
                            return false;
                        // else, pass if extension is allowed
                        const ext = f.slice(lastPeriod);
                        return list.includes(ext);
                    }).map(d => ({ name: d, type: 'file' }))
                ]);
        });
        async function getFolderItems(path) {
            const info = await serverPathInfo(appKey, path);
            // console.log(`...found ${info?.fileList.length} files and ${info?.dirList.length} dirs in '${path}' '${info?.path}'`)
            return info;
        }
    }, [path, item, appKey]);
    function setDialogOpen() {
    }
    return <div className={styles.fileElement}>
      <PathChain />
      <Scrollable className={styles.filesArea}>{dirItems.map(i => {
            const cls = `${styles.item} ${i.type === 'dir' ? styles.folder : ''} ${i.name === selected ? styles.selected : ''}`;
            return <div key={i.name} onClick={e => update(i, e)} onDoubleClick={e => doubleClick(i, e)} className={cls}>
               <Icon mdi={i.type === 'dir' ? mdiFolder : mdiFileDocumentOutline} size={15}/>
               {i.name}
            </div>;
        })}</Scrollable>
      <Dialog open={open => openDialog.current = open}/>
   </div>;
    function update(dirItem, e) {
        item.isDefault = false;
        item.value = [...path.split('/').filter(p => p.length > 0), dirItem.name].join('/');
        if (dirItem.type === 'dir')
            item.value += '/';
        setSelected(dirItem.name);
        doSideEffect(item, dialog.items);
        rerender();
    }
    async function doubleClick(dirItem, e) {
        item.isDefault = false;
        const pathArr = path.split('/').filter(p => p.length > 0);
        const p = [...pathArr, dirItem.name].join('/');
        if (dirItem.type === 'dir') {
            setPath(p);
            item.value = p;
            setSelected(null);
        }
        else {
            item.value = p;
            if (hasSaveButton(dialog.buttons)) {
                if (dirItems.some(item => [...pathArr, item.name].join('/').indexOf(p) === 0)) {
                    const result = await openDialog.current?.({
                        title: `File exists`,
                        items: [],
                        buttons: [
                            { id: 'Replace' },
                        ]
                    });
                    if (result?.actionName === 'Replace') {
                        select(DlgKeys.FileSelect);
                    }
                    return;
                }
            }
            select(DlgKeys.FileSelect);
        }
    }
    function PathChain() {
        const parts = `ROOT/${path}`.split('/');
        return <div className={styles.pathArea}>
         {parts.filter(p => p.length > 0).map((p, i) => <Fragment key={i}>
            {i > 0 && <span>/</span>}
            <span className={styles.pathPart} onClick={e => navigateToPart(i, e)}>{`${p ?? ''}`}</span>
         </Fragment>)}
      </div>;
        function navigateToPart(i, e) {
            const newPath = parts.map((p, j) => j === 0 ? '' : p).slice(0, i).join('/');
            if (newPath !== path) {
                setPath(newPath);
                item.value = newPath + '/';
                doSideEffect(item, dialog.items);
                rerender();
            }
        }
    }
    function hasSaveButton(buttons) {
        return buttons.some(b => b.id === saveButton);
    }
}
