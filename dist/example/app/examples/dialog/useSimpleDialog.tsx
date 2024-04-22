'use client'
import { DialogConfig, DialogReturn, OpenDialog } 
                     from "@/lib/components/Dialog";
import styles        from './page.module.scss'
import { Example }   from "./page";


export function useSimpleDialog():Example {
   return {
      name:    'Simple Dialog',
      instructions,
      configText, 
      processDialog
   }

   async function processDialog(open:OpenDialog):Promise<DialogReturn> {
      return await open(simpleDialogConfig)
   }
}


const instructions = <ul className={styles.instructions}>
   <li>Click <code>Show Dialog</code> and change the fields. <br/>
      <b>Hint:</b>You can move the box by dragging it in the title field.
   </li>
   <li>Click the <code>Ok</code> button when done. 
   The left box below will reflect the values from the dialog.</li>
</ul>

const simpleDialogConfig:DialogConfig = {
   title: `Simple Dialog Example:`,
   items:[
      { 'Enter Valid Number': { type:'number', initial: 0}},
   ],
   buttons:[
      { OK: {}}, 
   ]
}

const configText = `{
   title: 'Simple Dialog Example:',
   items:[
      { 'Enter Valid Number': { type:'number', initial: 0 }},
   ],
   buttons:[
      { OK: {}}, 
   ]
}`