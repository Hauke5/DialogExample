'use client';
import { useEffect, useRef, useState, useTransition } from "react";
import { useRerender } from "@hauke5/lib/hooks/useRerender";
import { Input } from "@hauke5/components/Input/Input";
import { ErrorBoundary } from "@hauke5/lib/errors";
import styles from './Dialog.module.scss';
const OFF_SCREEN = -10000;
export const cancelButton = 'Cancel';
export function addDialogItemHandler(handle, handler) {
    dialogItemHandlers[handle] = handler;
}
const dialogItemHandlers = {
    'none': dialogItemNoneHandler,
    default: dialogItemDefaultHandler
};
/**
 * ## Dialog
 * Provides a standardiazed dialog box.
 * `open` provides a hook for the calling function that
 * - allows it to open the dialog box by calling the hook with the content to show
 * - provides the interaction result as an asynchronous response, including the action taken and the values of all fields by name.
 *
 * ### Receiving results from the dialog
 * 1. via the open hook (preferred method):
 * Dialog results are provided as an asynchronous response the hook call
 * 2. via the `DialogAction` functions defined for each dialog button
 *
 *
 * Example for using `open` in the calling function:
 * ```
 * function CallingComponent() {
 *    const openDialog  = useRef<OpenDialog>()
 *    ...
 *    return <div>
 *       ...
 *       <Dialog open={open=>openDialog.current=open}/>
 *    </div>
 *
 *    async function callDialog() {
 *       if (openDialog.current) {
 *          const result = await openDialog.current?.(content)
 *          if (result.actionName === updateButton) {
 *             const action = result.actionName
 *             const volume = result.values[volumeKey].value as number
 *             ...
 *          }
 *       }
 *    }
 * }
 *
 * const volumeKey    = 'Volume'
 * const updateButton = 'Update'
 * const content = {
 *    title: `Example Dialog:`,
 *    items:[
 *       {[volumeKey]: { type:'number', initial,  label: 'Volume:' }},
 *    ],
 *    buttons:[
 *       {[updateButton]: {}}
 *    ]
 * }
 * ```
 * ### Parameters
 * - `open` the hook to call to open the dialog
 * - `x0` the initial x position in position in pixels
 * - `y0` the initial y position in position in pixels
 */
export function Dialog({ open, x0 = 100, y0 = 100 }) {
    const ref = useRef(null);
    const rerender = useRerender();
    const [config, setConfig] = useState();
    const [pos, setPos] = useState({ x: x0, y: y0, _x: -10000, _y: -10000 });
    const act = useRef((actionName) => undefined);
    // run once to provide opening hook to caller
    useEffect(() => {
        /**
         * Opens a modal dialog with the provided content
         * and sets up a response resolution
         * @param content
         * @returns
         */
        open(async function openWithContent(dialogConfig) {
            ref.current?.showModal();
            // initialize dialog with defaults, keep other values from prior dialog call
            const dialogItems = (dialogConfig.items ?? []).map(item => {
                return {
                    id: item.id,
                    type: item.type,
                    label: item.label ?? item.id,
                    isDefault: true,
                    initial: item.initial,
                    value: item.initial,
                    disable: item.disable ?? (() => false),
                    sideEffect: item.sideEffect ?? (() => []),
                    list: item.list ?? [],
                };
            });
            const dialogDesc = {
                title: dialogConfig.title,
                items: dialogItems,
                buttons: dialogConfig.buttons.filter(b => b !== null),
                description: dialogConfig.description
            };
            setConfig(dialogDesc);
            return new Promise((resolve) => {
                const ct = dialogDesc;
                /**
                 * called when Dialog signals a resulting `action` being called. Thus ia usually triggered by one of the dialog buttons,
                 * but can also originate elsewhere, e.g. when double clicking on a file
                 */
                act.current = (actionName) => {
                    // close the dialog box
                    ref.current?.close();
                    const items = Object.fromEntries((ct ? ct.items : []).map(item => [item.id, item]));
                    // respond to open call with the result
                    resolve({
                        actionName: actionName,
                        items,
                        value: (property) => {
                            const item = items[property];
                            if (!items)
                                throw Error(`undefined item name '${String(property)}' `);
                            return item.value;
                        }
                    });
                };
            });
        });
    }, [open, config]);
    const style = { top: pos.y, left: pos.x };
    const hasCancel = !!config?.buttons?.find(b => Object.keys(b)[0] === cancelButton);
    return <ErrorBoundary>
      <dialog ref={ref} style={style} className={styles.dialog} onMouseMove={duringMove} onMouseUp={endMove}>
         {config && <div className={styles.content}>
            <div className={styles.contentTitle} onMouseDown={startMove}>{config?.title}</div>
            {config?.description && <div className={styles.description}>{config.description}</div>}
            <div className={styles.contentArea}> 
               {config.items.map((item, i) => {
                const Handler = dialogItemHandlers[item.type] ?? dialogItemHandlers.default;
                return <Handler item={item} dialog={config} key={`${i}`} rerender={rerender} act={act.current}/>;
            })}
            </div>
            <div className={styles.buttonArea}>  
               {config?.buttons?.map(button => {
                const name = button.id;
                return !!button && <DlgButton name={name} button={button} act={act.current} dialog={config} key={`btn_${rerender.count()}_${String(name)}`}/>;
            })}
               {!hasCancel && <button onClick={() => act.current(cancelButton)} className={styles.cancel}>{cancelButton}</button>}
            </div>
         </div>}
      </dialog>
   </ErrorBoundary>;
    function startMove(e) {
        if (pos._x <= OFF_SCREEN)
            setPos({ x: pos.x, y: pos.y, _x: e.clientX - pos.x, _y: e.clientY - pos.y });
    }
    function duringMove(e) {
        if (pos._x > OFF_SCREEN) {
            setPos({ x: e.clientX - pos._x, y: e.clientY - pos._y, _x: pos._x, _y: pos._y });
        }
    }
    function endMove(e) {
        duringMove(e);
        if (pos._x > OFF_SCREEN)
            setPos({ x: pos.x, y: pos.y, _x: OFF_SCREEN, _y: OFF_SCREEN });
    }
}
function itemsLiteral(items) {
    const result = {};
    items.forEach(item => result[item.id] = item);
    return result;
}
/**
 * Default dialog item implementation.
 * Implements the types 'number', 'date', 'boolean', 'select', 'text';
 * and treats any other types as 'text'.
 */
function dialogItemDefaultHandler({ item, dialog, rerender }) {
    const disabled = typeof item.disable === 'boolean' ? item.disable : item.disable(itemsLiteral(dialog.items)) ?? false;
    const classNameLabel = `${styles.elementLabel} ${disabled ? styles.disabled : ''}`;
    const classNameValue = `${styles.elementValue} ${disabled ? styles.disabled : styles.editable}`;
    const label = item.label ?? item.key;
    const list = typeof item.list === 'function' ? item.list() : item.list;
    return <div className={styles.dialogItem}>
      <span className={classNameLabel}>{label}</span>
      <Input type={item.type} disabled={disabled} name={item.key} value={item.value} key={`${item.key}_${item.value}`} onChange={update} list={list} className={classNameValue}/>
   </div>;
    function update(newValue) {
        switch (item.type) {
            case 'number':
                item.value = +newValue;
                break;
            case 'date':
                item.value = new Date(`${newValue} 00:00`);
                break;
            case 'boolean':
                item.value = newValue === 'on' ? true : false;
                break;
            case 'select':
            case 'text':
            default: item.value = newValue;
        }
        item.isDefault = false;
        doSideEffect(item, dialog.items);
        rerender();
    }
}
/**
 * `None` dialog item implementation.
 * Implements the type 'none';
 */
function dialogItemNoneHandler({ item, dialog }) {
    const disabled = typeof item.disable === 'boolean' ? item.disable : item.disable(itemsLiteral(dialog.items)) ?? false;
    const classNameLabel = `${styles.elementLabel} ${disabled ? styles.disabled : ''}`;
    const classNameValue = `${styles.noneValue} ${disabled ? styles.disabled : ''}`;
    const label = item.label ?? item.key;
    return <div className={styles.dialogItem}>
      <span className={classNameLabel}>{label}</span>
      <span className={classNameValue}>{`${item.value}`}</span>
   </div>;
}
export function doSideEffect(item, items) {
    const changes = item.sideEffect?.(item.value, itemsLiteral(items)) ?? {};
    for (const name in changes) {
        const elmt = items.find(el => el.id === name);
        if (elmt?.isDefault && changes[name] !== undefined)
            elmt.value = changes[name];
    }
}
function DlgButton({ name, button, dialog, act }) {
    const [isPending, startTransition] = useTransition();
    const disabled = typeof button.disable === 'boolean' ? button.disable : button.disable?.(itemsLiteral(dialog.items));
    return <button onClick={e => disabled ? '' : click(e)} disabled={isPending || disabled}>{name}</button>;
    async function click(e) {
        e.preventDefault();
        act(name);
    }
}
