'use client'
import { useState }     from "react"
import { DialogConfig, DialogReturn, ItemsLiteral, OpenDialog } 
                        from "@/lib/components/Dialog";
import styles           from './page.module.scss'
import { Example }      from "./page";


const textfieldHistoryDefault = [
   'happy', 'sad', 'blue'
]

export function useDialogWithSideEffects():Example {
   const [textFieldHistory, setTextFieldHistory] = useState<string[]>(textfieldHistoryDefault)

   return {
      name:    'Dialog With Side Effects',
      instructions,
      configText, 
      processDialog
   }

   async function processDialog(open:OpenDialog):Promise<DialogReturn> {
      const result = await open(config(textFieldHistory))
      if (result.actionName===keys.okButton)
      setTextFieldHistory((list:string[]) => {
         const val = result.items[keys.textField].value as string
         if (!list.includes(val))
            list.push(val)
         return list.slice()
      })
      return result
   }
}

const instructions = <ul className={styles.instructions}>
   <li>Click <code>Show Dialog</code> and change the fields. <br/>
      <b>Hint:</b>You can move the box by dragging it in the title field.
   </li>
   <li>Side effects within the dialog:</li>
   <ul className={styles.instructions}>
      <li><b>isOKDisabled():</b> the <code>Ok</code> button will be disabled while 
      the <code>Number</code> field is <code>0</code></li>
      <li><b>numChanged():</b> Sets the <code>Text</code> field (<code>isDefault</code> is false)
      to <code>valid</code> or <code>invalid</code> depending on the <code>Number</code> field value, 
      unless the user has changed the <code>Text</code> field</li>
   </ul>
   <li>Click the <code>Ok</code> button when available. 
   The box below will reflect the values from the dialog.</li>
</ul>


const keys = {
   okButton:      'Ok',
   dateField:     'Date',
   numberField:   'Number', 
   textField:     'Text',
   checkBoxField: 'Checkbox',
   listField:     'List',
}

const config = (textfieldHistory:string[]):DialogConfig => ({
   title: `Dialog Example With Side-Effects:`,
   items:[
      {[keys.dateField]:{type:'date',   initial: new Date() }},
      {[keys.numberField]:{type:'number', initial: 0,         label:'Enter Valid Number:',  sideEffect:numChanged}},
      {[keys.textField]:{type:'text',   initial: 'invalid', list:textfieldHistory}},
      {[keys.checkBoxField]:{type:'boolean',initial: false}},
      {[keys.listField]:{type:'select', initial: 'two',     list:['one', 'two', 'three']}},
   ],
   buttons:[
      {[keys.okButton]: {disable:isOKDisabled}}, 
   ]
})

function isOKDisabled(values:ItemsLiteral) {
   return values[keys.numberField].value===0
}
function numChanged(value:number, items:ItemsLiteral):{[key:string]:any} {
   const textItem = items[keys.textField]
   return textItem.isDefault
      ? {[keys.textField]:(value !== 0)? 'valid number' : 'invalid number' }
      : {}
}

const configText = `{
   title: 'Dialog Example With Side-Effects:',
   items:[
      { Date:     {type:'date',   initial: new Date() }},
      { Number:   {type:'number', initial: 0,         label:'Enter Valid Number:',  sideEffect:numChanged}},
      { Text:     {type:'text',   initial: 'invalid', list:textfieldHistory}},
      { Chackbox: {type:'boolean',initial: false}},
      { List:     {type:'select', initial: 'two',     list:['one', 'two', 'three']}},
   ],
   buttons:[
      {[keys.okButton]: {disable:isOKDisabled}}, 
   ]
}

function isOKDisabled(values:ItemsLiteral) {
   return values.Number.value===0
}

function numChanged(value:number, values:ItemsLiteral):{[key:string]:any} {
   return values.Text.isDefault
      ? {Text: value!==0? 'valid number' : 'invalid number' }
      : {}
}
`
