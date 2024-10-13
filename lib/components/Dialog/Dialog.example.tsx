import { ReactNode, useEffect, useRef }       
                           from "react"
import { InputDataType }   from "../Input/Input"



export function DialogExample() {
   const openDialog  = useRef<OpenDialog>()
   return <>
      <form action={submit}>
         <input type="submit" value={`Submit`} />
      </form>
      <Dialog open={open=>openDialog.current=open}/>
   </>

   async function submit(formData:FormData) {
      if (openDialog.current) {
         const registration = await openDialog.current({
            title:      'title',
            items:         [
               { a:        {type:'text',   initial:'name',  label: 'Account Name:' }},
               { b:        {type:'number', initial:'name',  label: 'Account Name:' }},
            ], 
            buttons: [
               { Ok:       {id:'ok'}},
               { Cancel:   {id:'cancel'}
            }]
         })
         const reg2 = await openDialog.current(config)
         if (registration.actionName === 'Ok')
            console.log(registration.items.a?.type)
      }
   }
}


const config:DlgCfg = {
   title:      'title',
   items:         [
      { a:        {type:'text',   initial:'name',  label: 'Account Name:' }},
      { b:        {type:'number', initial:'name',  label: 'Account Name:' }},
   ], 
   buttons: [
      { Ok:       {id:'ok'}},
      { Cancel:   {id:'cancel'}
   }]
}


type DialogButtonConfig = {
   id:   string
}


export type DialogConfig<BUTTON_NAMES, ITEM_NAMES> = {
   title:         string
   description?:  ReactNode
   items:         {[Property in keyof ITEM_NAMES]:DialogItemConfig}[]
   buttons:       {[Property in keyof BUTTON_NAMES]: DialogButtonConfig}[]
}



export type DialogReturn<BUTTON_NAMES, ITEM_NAMES, RESULT_TYPE extends InputDataType> = {
   actionName?:   keyof BUTTON_NAMES
   items:         {[Property in keyof ITEM_NAMES]: DialogItemResult<RESULT_TYPE>}
}

export type DialogItemResult<RESULT extends InputDataType> = {
   value:      RESULT | undefined
   isDefault:  boolean
   type:       DlgType
}



type DlgCfg = Parameters<OpenDialog>[0]
export type OpenDialog = <DLG extends DialogConfig<BUTTON_NAMES, ITEM_NAMES>, 
                           RESULT_TYPE extends InputDataType,
                           BUTTON_NAMES=DLG['buttons'][0], 
                           ITEM_NAMES=DLG['items'][0],
   >(dialogConfig:DLG)=>Promise<DialogReturn<BUTTON_NAMES, ITEM_NAMES, RESULT_TYPE>>


type DialogProps  = {
   open: (openDialog:OpenDialog)=>void
}

function Dialog({open}:DialogProps) {
   useEffect(()=>{ 
      open(openWithContent) 

      async function openWithContent<BUTTON_NAMES, ITEM_NAMES, RESULT_TYPE extends InputDataType>(dialogConfig:DialogConfig<BUTTON_NAMES, ITEM_NAMES>):Promise<DialogReturn<BUTTON_NAMES, ITEM_NAMES, RESULT_TYPE>> {
         const result = {
            actionsName: Object.keys(dialogConfig.buttons[0])[0] as keyof BUTTON_NAMES,
            items:       Object.fromEntries(dialogConfig.items.map(item => {
               const key = Object.keys(item)[0] as keyof ITEM_NAMES
               return [key, {value: 0, isDefault:true, type:item[key].type} as DialogItemResult<RESULT_TYPE>]
            }))
         }
         return new Promise<DialogReturn<BUTTON_NAMES, ITEM_NAMES, RESULT_TYPE>>((resolve) => result)
      }
   },[open])
   return <div></div>
}



type DialogItemBaseConfig<RESULT extends InputDataType> = {
   type:          DlgType;
   /** the display label shown in the dialog; defaults to `key` */
   label?:        ReactNode
   /** the value to initialize the dialog */
   initial?:      RESULT 
   /** a function returning `true` if the element should be disabled */
   disable?:      DisableFn
   /** 
    * optional, will be called when changes occur to one dialog element. 
    * This function can trigger updates on other dialog elements that depend on this element 
    */
   sideEffect?:   SideEffect<RESULT>
}
type DialogItemNumberConfig      = DialogItemBaseConfig<number> 
type DialogItemBooleanConfig     = DialogItemBaseConfig<boolean>
type DialogItemTextConfig = DialogItemBaseConfig<string>  & {
   /** optional array of strings that provide a suggestion drop-down for text inputs  */
   list?:   string[] | (() => string[])
}
type DialogItemDateConfig        = DialogItemBaseConfig<Date>
type DialogItemSelectConfig      = DialogItemBaseConfig<string>   & {
   /** array of strings that provide a drop-down for available selections  */
   list:    string[] | (() => string[])
}
type DialogItemFileConfig        = DialogItemBaseConfig<string>   & {
   /** optional array of file extensions for File Dialogs */
   list?:   string[]
}
type DialogItemConfig = DialogItemNumberConfig | DialogItemBooleanConfig | DialogItemTextConfig | DialogItemDateConfig | DialogItemSelectConfig | DialogItemFileConfig





type DialogItemBase<TYPE, RESULT extends InputDataType=InputDataType> = {
   key:           string
   label:         ReactNode
   initial:       RESULT | undefined
   value:         RESULT
   isDefault:     boolean
   disable:       DisableFn   
   sideEffect:    SideEffect
   list:          string[] | (() => string[])
}
type DialogItemNumber   = DialogItemBase<number>   & {type: 'number'}
type DialogItemBoolean  = DialogItemBase<boolean>  & {type: 'boolean'}
type DialogItemText     = DialogItemBase<string>   & {type: 'text'}
type DialogItemDate     = DialogItemBase<Date>     & {type: 'date'}
type DialogItemSelect   = DialogItemBase<string>   & {type: 'select'}
type DialogItemFile     = DialogItemBase<string>   & {type: 'file'}

export type DialogItem = DialogItemNumber | DialogItemBoolean | DialogItemText | DialogItemDate | DialogItemSelect | DialogItemFile

export type DisableFn = (values:ItemsLiteral)=>boolean

export type ItemsLiteral = { [key:string]: DialogItem } 

type SideEffect<RESULT extends InputDataType=InputDataType> = (value:RESULT, values:ItemsLiteral)=>{[key:string]:any}


type DlgType = 'number' | 'boolean' | 'text' | 'date' | 'select' | 'file'
type DlgItemTypes = {
   number :  DialogItemNumber
   boolean:  DialogItemBoolean
   text   :  DialogItemText
   date   :  DialogItemDate
   select :  DialogItemSelect
   file   :  DialogItemFile
}
