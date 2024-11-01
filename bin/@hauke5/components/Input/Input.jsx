import { useId } from "react";
export function Input({ value, onChange: update, type, step = 'any', list, className, format, id, ...props }) {
    let inputID = useId();
    if (id)
        inputID = id; // useId cant be called conditionally
    const listID = useId();
    switch (type) {
        case 'number':
            return <input id={inputID} type='text' inputMode='decimal' defaultValue={`${value}`} onFocus={selectAll} onBlur={blur} onKeyUp={decimalKeyUp} className={className} step={step} {...props}/>;
        case 'date':
            const v = value.toISOString().substring(0, 10);
            return <input id={inputID} type='date' defaultValue={v} onFocus={selectAll} onBlur={blur} className={className} {...props}/>;
        case 'text':
            return <>
            <input id={inputID} type='text' defaultValue={`${value}`} key={`${value}`} onFocus={selectAll} onBlur={blur} onKeyUp={keyUp} className={className} list={listID} {...props}/>
            <datalist id={listID}>{list?.map((item, i) => <option value={item} key={`${item}_${i}_${list.length}`}/>)}</datalist>
         </>;
        case 'boolean':
            return <input id={inputID} type='checkbox' defaultChecked={value ? true : false} onFocus={selectAll} onBlur={blur} onChange={handleCheck} className={className} {...props}/>;
        case 'select':
            return <select id={inputID} defaultValue={`${value}`} onChange={handleSelect} className={className} title={props.title}>
            {list?.map(s => <option value={s} key={s}>{s}</option>)}
         </select>;
        case 'file':
            return <>
            <input id={inputID} type='file' key={`${value}`} onBlur={blur} className={className} {...props}/>
         </>;
        default:
            return <div>{`unknown type '${type}'`}</div>;
    }
    function decimalKeyUp(e) {
        if (e.key === 'Enter')
            e.target.blur();
        else {
            const newVal = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '+', '.'].indexOf(e.key) < 0
                ? e.target.value.replace(e.key, '')
                : e.target.value;
            e.target.value = format ? format(newVal) : newVal;
        }
    }
    function keyUp(e) {
        if (e.key === 'Enter')
            e.target.blur();
    }
    function selectAll() {
        const el = document.getElementById(inputID);
        el?.select();
    }
    function blur(e) {
        update(e.target.value);
    }
    function handleCheck() {
        update(value ? 'off' : 'on');
    }
    function handleSelect(e) {
        update(e.target.value);
    }
}
