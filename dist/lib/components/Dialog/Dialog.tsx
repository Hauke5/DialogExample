import { MouseEvent, useEffect, useRef, useState, useTransition }    
                                 from "react"
import { Rerender, useRerender } from "@/lib/hooks/useRerender"
import { BaseProps }             from "@/lib/components/BaseProps"
import { Input }                 from "@/lib/components/Input/Input"
import styles                    from './Dialog.module.scss'
import { DialogButton, DialogContent, DialogElementDesc, DialogExtendedContent, DialogReturn, ExtendedElement, OpenDialog }   
                                 from './DialogTypes'

const OFF_SCREEN = -10000

export const cancelButton = 'Cancel'

type DialogProps = BaseProps & {
   open:  (openDialog:OpenDialog)=>void
}


export type DialogHandlerProps = {
   el:         ExtendedElement
   dlgContent: DialogExtendedContent
   rerender:   Rerender
   act:        (action:string)=>void
}

export function addHandler(handle:string, handler:Handler) {
   handlers[handle] = handler
}

type Handler = (props: DialogHandlerProps) => JSX.Element
type Handlers = {
   [type:string]: Handler
}
const handlers:Handlers = {
   // defaut handler, supports 'number', 'date', 'boolean', 'select', 'text', and 'file' on client side
   default: DialogItem
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
   const [ct, setCT]    = useState<DialogExtendedContent>()
   const response       = useRef<(value: DialogReturn) => void>()
   const [pos, setPos]  = useState({x:100, y:100, _x:-10000, _y:-10000})

   // run once to provide opening hook to caller
   useEffect(()=>{ open(openWithContent) },[open])

   const style = {top: pos.y, left: pos.x}
   return <dialog ref={ref} style={style} className={styles.dialog} onMouseMove={duringMove} onMouseUp={endMove}>
      <div className={styles.content}>
         <div className={styles.contentTitle} onMouseDown={startMove}>{ct?.title}</div>
         <div className={styles.contentArea}> 
            {ct?.elements?.map(el => { 
               const Handler = handlers[el.type] ?? handlers.default
               return <Handler    el={el} dlgContent={ct} key={el.key} rerender={rerender} act={act}/>
            })}
         </div>
         <div className={styles.buttonArea}>  
            {ct?.buttons?.map(b => {
               const [name, button] = Object.entries(b)[0]
               return <DlgButton name={name} button={button} act={act} elements={ct.elements} key={`btn_${rerender.count()}_${name}`}/>
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
   async function openWithContent(content:DialogContent):Promise<DialogReturn> {
      ref.current?.showModal()
      // initialize dialog with defaults, keep other values from prior dialog call
      content.elements.forEach((el:DialogElementDesc) => {
         (el as ExtendedElement).isDefault = true
      })
      setCT(getExtendedContent(content))
      return new Promise<DialogReturn>((resolve) => response.current = resolve)
   }

   function act(action:string) {
      // close the dialog box
      ref.current?.close()
      // respond to open call with the result
      response.current?.({actionName: action, values:mapFromElements(ct!.elements)})
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


/** 
 * Default dialog item implementation.
 * Implements the types 'number', 'date', 'boolean', 'select', 'text'; 
 * and treats any other types as 'text'.
 */
function DialogItem({el, dlgContent, rerender}:{el:ExtendedElement, dlgContent: DialogExtendedContent, rerender:Rerender, act:(action:string)=>void}) {
   const disabled = el.disable?.(mapFromElements(dlgContent.elements)) ?? false
   const classNameLabel = `${styles.elementLabel} ${disabled?styles.disabled:''}`
   const classNameValue = `${styles.elementValue} ${disabled?styles.disabled:styles.editable}`
   const label = el.label ?? el.key
   const list = typeof el.list === 'function'? el.list() : el.list
   return <div className={styles.dialogItem}>
      <span className={classNameLabel}>{label}</span>
      <Input type={el.type} disabled={disabled} name={el.key} value={el.value} key={`${el.key}_${el.value}`} onChange={update} list={list}  className={classNameValue}/>
   </div>
   function update(newValue:string) {
      switch(el.type) {
         case 'number': el.value = +newValue; break;
         case 'date':   el.value = new Date(`${newValue} 00:00`); break;
         case 'boolean':el.value = newValue==='on'? true : false; break;
         case 'select': 
         case 'text': 
         default:       el.value = newValue;
      }         
      el.isDefault = false
      doSideEffect(el, dlgContent.elements)
      rerender()
   }
}

export function doSideEffect(elem:ExtendedElement, elements:(ExtendedElement)[]) {
   const changes = elem.sideEffect?.(elem.value, mapFromElements(elements)) ?? {}
   for (const key in changes) {
      const elmt = elements.find(el => el.key===key)
      if (elmt?.isDefault) elmt.value = changes[key]
   }
}

type DlgButtonProps = {
   name:                string
   button:              DialogButton
   elements:            (ExtendedElement)[]
   act:                 (action:string)=>void
}
function DlgButton({name, button, elements, act}:DlgButtonProps) {
   const [isPending, startTransition] = useTransition();
   const disabled = button.disable?.(mapFromElements(elements))

   return <button onClick={e=>disabled?'':click(e)} disabled={isPending||disabled}>{name}</button>
   
   async function click(e:MouseEvent) {
      e.preventDefault()
      act(name);
   }
}

const mapFromElements = (elements:ExtendedElement[]) => 
   Object.fromEntries(new Map<string,ExtendedElement>(elements.map(el => [el.key, el])))

function getExtendedContent(content:DialogContent) {
   const dialogContent = Object.assign({}, content) as DialogExtendedContent
   dialogContent.elements = dialogContent.elements.map(e => {
      e.value = e.value ?? e.initial ?? (typeof e.list==='function'? e.list() : e.list)?.[0] ?? '';
      e.rerender = 0
      e.isDefault = true
      return e
   })
   return dialogContent
}
