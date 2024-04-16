'use client'
import { useRef, useState }    
                     from "react"
import { Dialog, DialogContent, OpenDialog, ValuesMap } 
                     from "@/lib/components/Dialog";



const keys = {
   okButton:      'Ok',
   dateField:     'Date',
   numberField:   'Number', 
   textField:     'Text',
   checkBoxField: 'Checkbox',
   listField:     'List',
}

export default function DialogExample() {
   const [showDialog, setShowDialog] = useState(false)
   const [showPopup, setShowPopup] = useState(false)
   const openDialog        = useRef<OpenDialog>()
   const [list, setList] = useState<string[]>([])
   const [result, setResult] = useState({date:new Date(`1/1/2001`), number:0, text:'none', check:false, list:''})
   const style = {paddingLeft:'10px', lineHeight: '1.5em'}
   return <div style={style}>
      <h3>Dialog with side effects</h3>
      <ul style={{marginLeft: '20px'}}>
         <li>Click <code>Open Dialog</code> and change the fields. </li>
         <li>Side effects within the dialog:</li>
         <ul style={{marginLeft: '20px'}}>
            <li>the <code>Ok</code> button will become active only when the number field is not <code>0</code></li>
            <li>the text field&apos;s initial value will reflect whether the value in the 
               <code>number</code> field is <code>valid</code> (i.e. not <code>0</code>) or <code>invalid</code> (i.e. <code>0</code>)
            </li>
         </ul>
         <li>Then click the <code>Ok</code> button. The box below will reflect the values from the dialog.</li>
      </ul>
      <div style={{margin: '10px 0'}}>
         <button onClick={()=>processMenu(openDialog.current!)}>{showDialog?'Hide Dialog':'Show Dialog'}</button>
         <button onClick={()=>setShowPopup(!showPopup)}>{showPopup?'Hide Popup':'Show Popup'}</button>
      </div>
      <div style={{marginLeft: '5px', border:'1px solid #ccf'}}>
         <div>Dialog is {showDialog?'showing':'hiding'}</div>
         <div>date: {result.date.toDateString()}</div>
         <div>number: {result.number}</div>
         <div>text: {result.text}</div>
         <div>Check: {result.check?'on':'off'}</div>
         <div>Select: {result.list}</div>
      </div>
      <Dialog open={open=>openDialog.current=open} />
   </div>

   async function processMenu(openDialog:OpenDialog) {
      setShowDialog(true)
      const result = await openDialog(getContent())
      if (result.actionName===keys.okButton)
      setResult({
         date:   result.values[keys.dateField].value as Date,
         number: result.values[keys.numberField].value as number,
         text:   result.values[keys.textField].value as string,
         check:  result.values[keys.checkBoxField].value as boolean,
         list:   result.values[keys.listField].value as string,
      })
      setList(list => {
         list.push(result.values[keys.textField].value as string)
         return list.slice()
      })
      setShowDialog(false)
   }

   function getContent():DialogContent {
      return {
         title: `Example fields:`,
         elements:[
            { key:keys.dateField,    type:'date',   initial: new Date() },
            { key:keys.numberField,  type:'number', initial: 0,         label:'Enter Valid Number:',  sideEffect:numChanged},
            { key:keys.textField,    type:'text',   initial: 'invalid', list},
            { key:keys.checkBoxField,type:'boolean',initial: false},
            { key:keys.listField,    type:'select', initial: 'two',     list:['one', 'two', 'three']},
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
         // if (textElem?.isDefault) {
         //    textElem.value = (+value !== 0)? 'valid number' : 'invalid number'
         //    return {[keys.textField]:textElem.value }
         // }
         return textElem?.isDefault
            ? {[keys.textField]:(+value !== 0)? 'valid number' : 'invalid number' }
            : {}
      }
   }
}
