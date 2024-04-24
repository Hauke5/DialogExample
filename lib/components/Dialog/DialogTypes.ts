'use client'
import { ReactNode }    from "react"
import { InputDataType, InputType } 
                        from "../Input/Input";


export type OpenDialog = (dialogConfig:DialogConfig)=>Promise<DialogReturn>

export type DialogConfig = {
   title:      string;
   items:      {[elementName:string]:DialogItemConfig}[]
   buttons:    {[buttonName:string]: DialogButtonConfig}[]
}

type DialogItemBaseConfig<RESULT extends InputDataType=InputDataType> = {
   /** the display label shown in the dialog; defaults to `key` */
   label?:        ReactNode
   /** the value to initialize the dialog */
   initial?:      RESULT 
   /** a function returning `true` if the element should be disabled */
   disable?:      Disable   
   /** 
    * optional, will be called when changes occur to one dialog element. 
    * This function can trigger updates on other dialog elements that depend on this element 
    */
   sideEffect?:   SideEffect<RESULT>
}
type DialogItemNumberConfig = DialogItemBaseConfig<number> & {
   type:    'number'
}
type DialogItemBooleanConfig = DialogItemBaseConfig<boolean> & {
   type:    'boolean'
}
export type DialogItemTextConfig = DialogItemBaseConfig<string> & {
   type:    'text'
   /** optional array of strings that provide a suggestion drop-down for text inputs  */
   list?:   string[] | (() => string[])
}
type DialogItemDateConfig = DialogItemBaseConfig<Date> & {
   type:    'date'
}
type DialogItemSelectConfig = DialogItemBaseConfig<string> & {
   type:    'select'
   /** optional array of strings that provide a drop-down for available selections  */
   list:    string[] | (() => string[])
}
type DialogItemFileConfig = DialogItemBaseConfig<string> & {
   type:    'file'
   /** optional array of file extensions for File Dialogs */
   list?:   string[]
}
export type DialogItemConfig = DialogItemNumberConfig | DialogItemBooleanConfig | DialogItemTextConfig
                      | DialogItemDateConfig | DialogItemSelectConfig | DialogItemFileConfig


export type DialogButtonConfig = {
   disable?:      Disable
   /** the display label shown in the dialog; defaults to `key` */
   label?:        ReactNode
}

type DialogItemBase<RESULT extends InputDataType=InputDataType> = {
   key:           string
   label:         ReactNode
   initial:       RESULT | undefined
   value:         RESULT
   isDefault:     boolean
   disable:       Disable   
   sideEffect:    SideEffect
   list:          string[] | (() => string[])
}
type DialogItemNumber   = DialogItemBase<number>   & {type: 'number'}
type DialogItemBoolean  = DialogItemBase<boolean>  & {type: 'boolean'}
type DialogItemText     = DialogItemBase<string>   & {type: 'text'}
type DialogItemDate     = DialogItemBase<Date>     & {type: 'date'}
type DialogItemSelect   = DialogItemBase<string>   & {type: 'select'}
type DialogItemFile     = DialogItemBase<string>   & {type: 'file'}
export type DialogItem = DialogItemNumber | DialogItemBoolean | DialogItemText
                      | DialogItemDate | DialogItemSelect | DialogItemFile


export type DialogDesc = {
   class?:     string;
   style?:     string;
   title:      string;
   items:      DialogItem[]
   buttons:    {[buttonName:string]: DialogButtonConfig}[]
}

export type ItemsResultLiteral = { [key:string]: DialogItemResult } 
export type ItemsLiteral = { [key:string]: DialogItem } 

type SideEffect<RESULT extends InputDataType=InputDataType> = (value:RESULT, values:ItemsLiteral)=>{[key:string]:any}

export type Disable = (values:ItemsLiteral)=>boolean

export type DialogReturn = {
   actionName?:   string
   items:         ItemsResultLiteral
}

export type DialogItemResult<RESULT extends InputDataType=InputDataType> = {
   value:      RESULT | undefined
   isDefault:  boolean
   type:       InputType
}


