'use client'
import { useRef, useState }    
                     from "react"
import { Dialog, OpenDialog } 
                     from "@/lib/components/Dialog";
import { content, keys } 
                     from "./dialogContent";
import styles        from './page.module.scss'


type DialogResult = {
   date:    Date 
   number:  number
   text:    string
   check:   boolean, 
   list:    string
}

const dialogDefault:DialogResult = {
   date:new Date(`1/1/2001`), 
   number:0, 
   text:'none', 
   check:false, 
   list:''
}

const textfieldHistoryDefault = [
   'happy', 'sad', 'blue'
]


export default function DialogExample() {
   const openDialog            = useRef<OpenDialog>()
   const [showing, setShowing] = useState(false)
   const [textFieldHistory, setTextFieldHistory] = useState<string[]>(textfieldHistoryDefault)
   const [result, setResult] = useState<DialogResult>(dialogDefault)

   return <div className={styles.page}>
      <h2 className={styles.pageTitle}>Dialog with side effects</h2>
      <Instructions />
      <div className={styles.button}>
         <button onClick={processMenu}>{showing?'Hide Dialog':'Show Dialog'}</button>
      </div>
      <div className={styles.resultConfig}>
         <DialogResult result={result} showing={showing}/>
         <DialogConfig />
      </div>
      <Dialog open={open=>openDialog.current=open} />
   </div>

   async function processMenu() {
      if (!openDialog.current) return
      setShowing(true)
      const result = await openDialog.current(content(textFieldHistory))
      if (result.actionName===keys.okButton)
      setResult({
         date:   result.values[keys.dateField].value as Date,
         number: result.values[keys.numberField].value as number,
         text:   result.values[keys.textField].value as string,
         check:  result.values[keys.checkBoxField].value as boolean,
         list:   result.values[keys.listField].value as string,
      })
      setTextFieldHistory(list => {
         const val = result.values[keys.textField].value as string
         if (!list.includes(val))
            list.push(val)
         return list.slice()
      })
      setShowing(false)
   }
}

function Instructions() {
   return <ul className={styles.instructions}>
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
}

function DialogResult({result, showing}:{result:DialogResult, showing:boolean}) {
   return <div className={styles.dialogResult}>
      <div className={styles.title}>Updated by Dialog:</div>
      <div>Dialog is {showing?'showing':'hiding'}</div>
      <div>date: {result.date.toDateString()}</div>
      <div>number: {result.number}</div>
      <div>text: {result.text}</div>
      <div>Check: {result.check?'on':'off'}</div>
      <div>Select: {result.list}</div>
   </div>
}

function DialogConfig() {
   return <div>
      <div className={styles.title}>Dialog Configuration:</div>
      <pre className={styles.dialogConfig}>{config}</pre>
   </div>
}


const config = `{
   title: 'Example fields:',
   elements:[
      { key:'Date',    type:'date',   initial: new Date() },

      { key:'Number',  type:'number', initial: 0,         
        label:'Enter Valid Number:',  sideEffect:numChanged},

      { key:'Text',    type:'text',   initial: 'invalid', 
        list:['happy', 'sad', 'blue']},

      { key:'Checkbox',type:'boolean',initial: false},

      { key:'List',    type:'select', initial: 'two',     
        list:['one', 'two', 'three']},
   ],
   buttons:[
      {Ok: {disable:isOKDisabled}}, 
   ]
}

function isOKDisabled(values:ValuesMap) {
   return values[keys.numberField].value===0
}

function numChanged(value:number, values:ValuesMap):{[key:string]:any} {
   const textElem = values[keys.textField]
   return textElem?.isDefault
      ? {[keys.textField]:(+value !== 0)? 'valid number' : 'invalid number' }
      : {}
}
`
