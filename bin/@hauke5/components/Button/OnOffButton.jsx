'use client';
import { useEffect, useState } from 'react';
import styles from './Button.module.scss';
export function OnOffButton({ onChange, children, vertical, initialState, className, ...props }) {
    const [on, setOn] = useState(initialState ?? false);
    useEffect(() => {
        if (typeof initialState === 'boolean')
            setOn(initialState);
    }, [initialState]);
    const click = () => {
        setOn(on => !on);
        onChange(!on);
    };
    return <div className={`${styles.onOffButton} ${vertical ? styles.vertical : styles.horizontal} ${className ?? ''}`} {...props}>
      <div>{children}</div>
      <div className={`${styles.slot} ${on ? styles.on : styles.off}`} onClick={click}>
         <div className={styles.slider}></div>
      </div>
   </div>;
}
