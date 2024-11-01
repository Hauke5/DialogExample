'use client';
import { useState } from "react";
import styles from './page.module.scss';
const textfieldHistoryDefault = [
    'happy', 'sad', 'blue'
];
export function useDialogWithSideEffects() {
    const [textFieldHistory, setTextFieldHistory] = useState(textfieldHistoryDefault);
    return {
        name: 'Dialog With Side Effects',
        instructions,
        configText,
        processDialog
    };
    async function processDialog(open) {
        const result = await open({
            title: `Dialog Example With Side-Effects:`,
            description: <div style={{ borderBottom: "1px solid gray" }}>
            A <b>complex</b> dialog:
            <ul className={styles.instructions}>
               <li><b>Hint:</b>You can move the box by dragging it in the title field.</li>
               <li><b>Side effects</b> within the dialog:</li>
               <ul className={styles.instructions}>
                  <li><b>Ok Disabled</b>: Enter a number other than <code>0</code> in the the <code>Number</code> field to enable the <code>Ok</code> button.</li>
                  <li><b>Field auto-values</b>: Changing the <code>Number</code> field automatically sets the <code>Text</code> field <br />
                  to <code>valid</code> or <code>invalid</code> depending on the <code>Number</code> field value, <br />
                  unless the user has manually changed it before</li>
               </ul>
               <li>Click the <code>Ok</code> button when available. 
               The left box below will reflect the values from the dialog.</li>
            </ul>
         </div>,
            items: [
                { id: 'Date', type: 'date', initial: new Date() },
                { id: 'Number', type: 'number', initial: 0, label: 'Enter Valid Number:', sideEffect: (value, items) => items.Text.isDefault
                        ? { Text: (value !== 0) ? 'valid number' : 'invalid number' }
                        : {}
                },
                { id: 'List', type: 'select', initial: 'two', list: ['one', 'two', 'three'] },
                { id: 'Checkbox', type: 'boolean', initial: false },
                { id: 'Text', type: 'text', initial: 'invalid', list: textFieldHistory },
            ],
            buttons: [
                { id: 'Ok', disable: (values) => values.Number.value === 0 },
            ]
        });
        if (result.actionName === 'Ok')
            setTextFieldHistory((list) => {
                const val = result.items.Text.value;
                if (!list.includes(val))
                    list.push(val);
                return list.slice();
            });
        return {
            actionName: result.actionName === 'Ok' ? 'ok' : 'unknown',
            items: [
                { id: result.items.Date.id, value: `${result.items.Date.value}` },
                { id: result.items.Number.id, value: `${result.items.Number.value}` },
                { id: result.items.Text.id, value: `${result.items.Text.value}` },
                { id: result.items.Checkbox.id, value: `${result.items.Checkbox.value}` },
                { id: result.items.List.id, value: `${result.items.List.value}` },
            ]
        };
    }
}
const instructions = <ul className={styles.instructions}>
   <li>Click <code>Show Dialog</code> and change the fields. <br />
      <b>Hint:</b>You can move the box by dragging it in the title field.
   </li>
   <li>Side effects within the dialog:</li>
   <ul className={styles.instructions}>
   <li><b>Ok Disabled</b>: Enter a number other than <code>0</code> in the the <code>Number</code> field to enable the <code>Ok</code> button.</li>
   <li><b>Field auto-values</b>:Changing the <code>Number</code> field automatically sets the <code>Text</code> field 
         to <code>valid</code> or <code>invalid</code> depending on the <code>Number</code> field value, 
         unless the user has manually changed it before</li>
   </ul>
   <li>Click the <code>Ok</code> button when available. 
   The left box below will reflect the values from the dialog.</li>
</ul>;
const configText = `{
   title: 'Dialog Example With Side-Effects:',
   description:  <div style={{borderBottom:"1px solid gray"}}>
      A <b>complex</b> dialog:
      <ul className={styles.instructions}>
         <li><b>Hint:</b>You can move the box by dragging it in the title field.</li>
         <li>Side effects within the dialog:</li>
         <ul className={styles.instructions}>
            <li><b>Ok Disabled</b>: Enter a number other than <code>0</code> in the the <code>Number</code> field to enable the <code>Ok</code> button.</li>
            <li><b>Field auto-values</b>:Changing the <code>Number</code> field automatically sets the <code>Text</code> field 
            to <code>valid</code> or <code>invalid</code> depending on the <code>Number</code> field value, 
            unless the user has manually changed it before</li>
         </ul>
         <li>Click the <code>Ok</code> button when available. 
         The left box below will reflect the values from the dialog.</li>
      </ul>
   </div>,
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
}`;
