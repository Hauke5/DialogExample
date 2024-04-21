'use client'
import { ReactNode, useEffect, useRef, useState }    
                                 from "react"
import { Dialog, DialogReturn, OpenDialog } 
                                 from "@/lib/components/Dialog";
import styles                    from './page.module.scss'
import { useDialogWithSideEffects } from "./DialogWithSideEffects";
import { useSimpleDialog }          from "./SimpleDialog";

export type Example = {
   name:          string
   instructions:  ReactNode,
   configText:    string
   processDialog: (open:OpenDialog)=>Promise<DialogReturn>
}

const voidProcess = async ():Promise<DialogReturn> => ({
   actionName: '',
   items:      {}
})

export default function DialogExample() {
   const examples              = useRef<Example[]>([{name:'', instructions: <></>, configText: '', processDialog:voidProcess}])
   useEffect(()=>{
      examples.current.push(useSimpleDialog())
      examples.current.push(useDialogWithSideEffects())
   },[])
   const [showing, setShowing] = useState(false)
   const openDialog            = useRef<OpenDialog>()
   const [app, setApp]         = useState(0)
   const [result, setResult]   = useState<DialogReturn>()
   return <div className={styles.app}>
      {examples.current.map((ex, i) => <div onClick={()=>setApp(i)}>{ex.name}</div>)}
      {examples.current[app].instructions}
      <div className={styles.button}>
         <button onClick={runDialog}>{showing?'Hide Dialog':'Show Dialog'}</button>
      </div>
      <DialogResult result={result} showing={showing}/>
      <DialogConfig configText={examples.current[app].configText}/>
      <Dialog open={(open:OpenDialog)=>openDialog.current=open} />
   </div>

   async function runDialog() {
      setShowing(true)
      if (openDialog.current) {
         const result = await examples.current[app].processDialog(openDialog.current)
         setResult(result)
      }
      setShowing(false)
   }
}

function DialogResult({result, showing}:{result?:DialogReturn, showing:boolean}) {
   return <div className={styles.dialogResult}>
      <div className={styles.title}>Updated by Dialog:</div>
      <div>Dialog is {showing?'showing':'hiding'}</div>
      <div>{`Button pressed: ${result?.actionName}`}</div>
      {result && Object.entries(result.items).map(([key, item])=> <div>
         {`${key}: ${item}`}
      </div>)}
   </div>
}

function DialogConfig({configText}:{configText:string}) {
   return <div>
      <div className={styles.title}>Dialog Configuration:</div>
      <pre className={styles.dialogConfig}>{configText}</pre>
   </div>
}
