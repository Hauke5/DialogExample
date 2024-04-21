import { MouseEvent, useEffect, useRef, useState, useTransition }    
                                 from "react"
import { Rerender, useRerender } from "@/lib/hooks/useRerender"
import { BaseProps }             from "@/lib/components/BaseProps"
import { Input }                 from "@/lib/components/Input/Input"
import styles                    from './Dialog.module.scss'
import { DialogConfig, DialogButtonConfig,  DialogReturn, DialogDesc, DialogItem, OpenDialog, ItemsLiteral, DialogItemTextConfig, ItemsResultLiteral }   
                                 from './DialogTypes'

const OFF_SCREEN = -10000

export const cancelButton = 'Cancel'

type DialogProps = BaseProps & {
   open:  (openDialog:OpenDialog)=>void
}


export type DialogItemHandlerProps = {
   item:       DialogItem
   dialog:     DialogDesc
   rerender:   Rerender
   act:        (action:string)=>void
}

export function addDialogItemHandler(handle:string, handler:DialogItemHandler) {
   dialogItemHandlers[handle] = handler
}

type DialogItemHandler = (props: DialogItemHandlerProps) => JSX.Element
type DialogItemHandlers = {
   [type:string]: DialogItemHandler
}
const dialogItemHandlers:DialogItemHandlers = {
   // defaut handler, supports 'number', 'date', 'boolean', 'select', 'text', and 'file' on client side
   default: DialogItemHandler
}

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
 *    elements:[
 *       { key:volumeKey,  type:'number', initial,  label: 'Volume:' },
 *    ],
 *    buttons:[
 *       {[updateButton]: {}}
 *    ]
 * }
 * ```
 */
export function Dialog({open}:DialogProps) {
   const ref            = useRef<HTMLDialogElement>(null)
   const rerender       = useRerender()
   const [ct, setCT]    = useState<DialogDesc>()
   const response       = useRef<(value: DialogReturn) => void>()
   const [pos, setPos]  = useState({x:100, y:100, _x:-10000, _y:-10000})

   // run once to provide opening hook to caller
   useEffect(()=>{ open(openWithContent) },[open])

   const style = {top: pos.y, left: pos.x}
   if (!ct) return <></>
   return <dialog ref={ref} style={style} className={styles.dialog} onMouseMove={duringMove} onMouseUp={endMove}>
      <div className={styles.content}>
         <div className={styles.contentTitle} onMouseDown={startMove}>{ct?.title}</div>
         <div className={styles.contentArea}> 
            {ct.items.map(item => { 
               const Handler = dialogItemHandlers[item.type] ?? dialogItemHandlers.default
               return <Handler item={item} dialog={ct} key={item.key} rerender={rerender} act={act}/>
            })}
         </div>
         <div className={styles.buttonArea}>  
            {ct?.buttons?.map(b => {
               const [name, button] = Object.entries(b)[0]
               return <DlgButton name={name} button={button} act={act} dialog={ct} key={`btn_${rerender.count()}_${name}`}/>
            })}
            <button onClick={()=>act(cancelButton)} className={styles.cancel}>{cancelButton}</button>
         </div>
      </div>
   </dialog>

   /**
    * Opens a modal dialog with the provided content 
    * and sets up a response resolution
    * @param content 
    * @returns 
    */
   async function openWithContent(content:DialogConfig):Promise<DialogReturn> {
      ref.current?.showModal()
      // initialize dialog with defaults, keep other values from prior dialog call
      const dialogItems:DialogItem[] = content.items.map(dialogItem => {
         const [key, item] = Object.entries(dialogItem)[0]
         return {
            key,
            type:       item.type,
            label:      item.label ?? key,
            isDefault:  true,
            initial:    item.initial as typeof item.type,
            value:      item.initial as typeof item.type,
            disable:    item.disable ?? (()=>false),
            sideEffect: item.sideEffect ?? (()=>({})),
            list:       (item as DialogItemTextConfig).list ?? [],
         } as DialogItem
      })
      const dialogDesc = {
         title:      content.title,
         items:      dialogItems,
         buttons:    content.buttons,    
      }
      setCT(dialogDesc)
      return new Promise<DialogReturn>((resolve) => response.current = resolve)
   }

   /** 
    * called when Dialog signals a resulting `action` being called. Thus ia usually triggered by one of the dialog buttons,
    * but can also originate elsewhere, e.g. when double clicking on a file 
    */
   function act(actionName:string) {
      // close the dialog box
      ref.current?.close()
      const items = ct? itemsResultLiteral(ct?.items) : {}
      // respond to open call with the result
      response.current?.({actionName, items})
   }

   function startMove(e:MouseEvent) {
      if (pos._x<=OFF_SCREEN) setPos({x:pos.x, y:pos.y, _x:e.clientX-pos.x, _y:e.clientY-pos.y})
   }
   function duringMove(e:MouseEvent) {
      if (pos._x>OFF_SCREEN) {
         setPos({x:e.clientX - pos._x, y:e.clientY - pos._y, _x:pos._x, _y:pos._y})
      }
   }
   function endMove(e:MouseEvent) {
      duringMove(e)
      if (pos._x>OFF_SCREEN) setPos({x:pos.x, y:pos.y, _x:OFF_SCREEN ,_y:OFF_SCREEN})
   }
}

function itemsResultLiteral(items:DialogItem[]):ItemsResultLiteral {
   return Object.fromEntries(items.map(item => [item.key, {
      value:      item.value,
      isDefault:  item.isDefault,
      type:       item.type,
   }]))
}
function itemsLiteral(items:DialogItem[]):ItemsLiteral {
   return Object.fromEntries(items.map(item => [item.key, item]))
}

/** 
 * Default dialog item implementation.
 * Implements the types 'number', 'date', 'boolean', 'select', 'text'; 
 * and treats any other types as 'text'.
 */
function DialogItemHandler({item, dialog, rerender}:{item:DialogItem, dialog: DialogDesc, rerender:Rerender, act:(action:string)=>void}) {
   const disabled = item.disable(itemsLiteral(dialog.items)) ?? false
   const classNameLabel = `${styles.elementLabel} ${disabled?styles.disabled:''}`
   const classNameValue = `${styles.elementValue} ${disabled?styles.disabled:styles.editable}`
   const label = item.label ?? item.key
   const list = typeof item.list === 'function'? item.list() : item.list
   return <div className={styles.dialogItem}>
      <span className={classNameLabel}>{label}</span>
      <Input type={item.type} disabled={disabled} name={item.key} value={item.value} key={`${item.key}_${item.value}`} onChange={update} list={list}  className={classNameValue}/>
   </div>
   function update(newValue:string) {
      switch(item.type) {
         case 'number': item.value = +newValue; break;
         case 'date':   item.value = new Date(`${newValue} 00:00`); break;
         case 'boolean':item.value = newValue==='on'? true : false; break;
         case 'select': 
         case 'text': 
         default:       item.value = newValue;
      }         
      item.isDefault = false
      doSideEffect(item, dialog.items)
      rerender()
   }
}

export function doSideEffect(item:DialogItem, items:DialogItem[]) {
   const changes = item.sideEffect?.(item.value, itemsLiteral(items)) ?? {}
   for (const key in changes) {
      const elmt = items.find(el => el.key===key)
      if (elmt?.isDefault) elmt.value = changes[key]
   }
}

type DlgButtonProps = {
   name:    string
   button:  DialogButtonConfig
   dialog:  DialogDesc
   act:     (action:string)=>void
}
function DlgButton({name, button, dialog, act}:DlgButtonProps) {
   const [isPending, startTransition] = useTransition();
   const disabled = button.disable?.(itemsLiteral(dialog.items))

   return <button onClick={e=>disabled?'':click(e)} disabled={isPending||disabled}>{name}</button>
   
   async function click(e:MouseEvent) {
      e.preventDefault()
      act(name);
   }
}

// const mapFromElements = (dialog:  DialogDesc) => 
//    Object.fromEntries(new Map<string,ExtendedElement>(dialog.items.map(item => [item.key, item])))

