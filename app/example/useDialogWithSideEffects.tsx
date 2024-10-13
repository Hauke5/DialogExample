'use client'
import { useState }     from "react"
import { DlgReturn, ItemsLiteral, OpenDialog } 
                        from "@/lib/components/Dialog";
import styles           from './page.module.scss'
import { DialogReturn, Example }      from "./page";


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
      const result = await open({
         title: `Dialog Example With Side-Effects:`,
         items:[
            {id:'Date',      type:'date',   initial: new Date() },
            {id:'Number',    type:'number', initial: 0,   label:'Enter Valid Number:',  sideEffect:(value:number, items) => 
               items.Text.isDefault
                  ? {Text:(value !== 0)? 'valid number' : 'invalid number' }
                  : {}
            },
            {id:'Text',      type:'text',   initial: 'invalid', list:textFieldHistory},
            {id:'Checkbox',  type:'boolean',initial: false},
            {id:'List',      type:'select', initial: 'two',     list:['one', 'two', 'three']},
         ],
         buttons:[
            {id:'Ok', disable:(values) => values.Number.value===0}, 
         ]
      })
      if (result.actionName==='Ok')

      setTextFieldHistory((list:string[]) => {
         const val = result.items.Text.value as string
         if (!list.includes(val)) list.push(val)
         return list.slice()
      })

      return {
         actionName: result.actionName==='Ok'? 'ok' : 'unknown',
         items:  [
            { id: result.items.Date.id,      value: `${result.items.Date.value}`},
            { id: result.items.Number.id,    value: `${result.items.Number.value}`},
            { id: result.items.Text.id,      value: `${result.items.Text.value}`},
            { id: result.items.Checkbox.id,  value: `${result.items.Checkbox.value}`},
            { id: result.items.List.id,      value: `${result.items.List.value}`},
         ]
      }
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
   The left box below will reflect the values from the dialog.</li>
</ul>


const configText = `{
   title: 'Dialog Example With Side-Effects:',
   items:[
      {id:'Date',      type:'date',   initial: new Date() },
      {id:'Number',    type:'number', initial: 0,   label:'Enter Valid Number:',  sideEffect:(value:number, items) => 
         items.Text.isDefault
            ? {Text:(value !== 0)? 'valid number' : 'invalid number' }
            : {}
      },
      {id:'Text',      type:'text',   initial: 'invalid', list:textFieldHistory},
      {id:'Checkbox',  type:'boolean',initial: false},
      {id:'List',      type:'select', initial: 'two',     list:['one', 'two', 'three']},
   ],
   buttons:[
      {id:'Ok', disable:(values) => values.Number.value===0}, 
   ]
}
`

