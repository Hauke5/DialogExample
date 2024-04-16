import { DialogContent, ValuesMap } from "@/lib/components/Dialog"


export const keys = {
   okButton:      'Ok',
   dateField:     'Date',
   numberField:   'Number', 
   textField:     'Text',
   checkBoxField: 'Checkbox',
   listField:     'List',
}

export const content = (textfieldHistory:string[]):DialogContent => ({
   title: `Example fields:`,
   elements:[
      { key:keys.dateField,    type:'date',   initial: new Date() },
      { key:keys.numberField,  type:'number', initial: 0,         label:'Enter Valid Number:',  sideEffect:numChanged},
      { key:keys.textField,    type:'text',   initial: 'invalid', list:textfieldHistory},
      { key:keys.checkBoxField,type:'boolean',initial: false},
      { key:keys.listField,    type:'select', initial: 'two',     list:['one', 'two', 'three']},
   ],
   buttons:[
      {[keys.okButton]: {disable:isOKDisabled}}, 
   ]
})

function isOKDisabled(values:ValuesMap) {
   return values[keys.numberField].value===0
}
function numChanged(value:number, values:ValuesMap):{[key:string]:any} {
   const textElem = values[keys.textField]
   return textElem?.isDefault
      ? {[keys.textField]:(+value !== 0)? 'valid number' : 'invalid number' }
      : {}
}
