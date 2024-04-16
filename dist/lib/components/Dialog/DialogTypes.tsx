'use client'
import { ReactNode }    from "react"
import { InputDataType, InputType } 
                        from "../Input/Input";


/**
 * ### DialogContent
 * describes the content of the dialog box.
 * - class: if specified, applies a `css` class to the dialog box.
 * - style: if specified, applies a `css` style string to the dialog box
 * - title: the title in the box header
 * - elements: a list of entry [`Element`]()s to show
 * - buttons: a list of buttons to add
 */
export interface DialogContent{
   class?:     string;
   style?:     string;
   title:      string;
   elements:   DialogElementDesc[];
   buttons:    {[buttonName:string]: DialogButton}[]
}

export type ValuesMap = { [key:string]: ExtendedElement } 

export interface DialogExtendedContent extends DialogContent {
    elements:   (DialogElementDesc & ExtendedElement)[]
}

export interface DialogButton {
   // action?:    DialogAction
   disable?:   (values:ValuesMap)=>boolean
}

/**
 * conveys the result of a dialog, 
 */
export type DialogResult = ValuesMap

/**
 * Basic shared elements of a dialog descriptor.
 */
export type DialogElementDesc = { 
   /** the identifier for this descriptor. */
   key:           string
   /** the dialog type */
   type:          InputType
   /** the display label shown in the dialog; defaults to `key` */
   label?:        string
   /** the value to initialize the dialog */
   initial?:      InputDataType 
   /** a function returning `true` if the element should be disabled */
   disable?:      (values:ValuesMap)=>boolean     
   /** 
    * optional, will be called when changes occur to one dialog element. 
    * This function can trigger updates on other dialog elements that depend on this element 
    */
   sideEffect?:   SideEffect
   /** optional array of strings that provide a suggestion drop-down for text inputs  */
   list?:         string[] | (() => string[])
   /** optional array of file extensions for File Dialogs */
   extensions?:   string[]
}


export type ExtendedElement = DialogElementDesc & {
   /** internal rerender count, used as a key to force a `React` redraw */
   rerender?:     number
   /** 
    * internal flag to indicate if element shows the default value, or has been modified by the user.
    * This is used, e.g., while processing `sideEffects`
    */
   isDefault?:    boolean
   /** renders the elements DOM representation */
   showValue:     (doSideEffect:DoSideEffects, values:ValuesMap) => ReactNode
   /** the current value of the element  */
   value:         InputDataType
}


export interface SideEffect {
   (value:any, values:ValuesMap):{[key:string]:any}
}      

export interface DoSideEffects {
   (elem:ExtendedElement): void
}


export type OpenDialog = (dialogContent:DialogContent)=>Promise<DialogReturn>
export type DoDialog = (open?:OpenDialog)=>Promise<void>

export type DialogReturn = {
   actionName?:   string
   values:        ValuesMap
}
