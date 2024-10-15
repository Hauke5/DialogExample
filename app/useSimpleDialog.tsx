'use client'
import { DlgReturn, OpenDialog } 
                     from "@/lib/components/Dialog";
import styles        from './page.module.scss'
import { DialogReturn, Example }   from "./page";


export function useSimpleDialog():Example {
   return {
      name:    'Simple Dialog',
      instructions,
      configText, 
      processDialog
   }

   async function processDialog(open:OpenDialog):Promise<DialogReturn> {
      const result = await open({
         title: `Simple Dialog Example:`,
         items:[],
         buttons:[
            { id:'OK' }, 
         ]
      })
      return {
         actionName: result.actionName==='OK'? 'ok' : 'cancel',
         items:  []
      }
   }
}


const instructions = <ul className={styles.instructions}>
   <li>Click <code>Show Dialog</code> and change the fields. <br/>
      <b>Hint:</b>You can move the box by dragging it in the title field.
   </li>
   <li>Click the <code>OK</code> button when done. 
   The left box below will reflect the status of the dialog and the result.</li>
</ul>


const configText = `{
   title: 'Simple Dialog Example:',
   items:[],
   buttons:[
      { id:'OK' }, 
   ]
}`