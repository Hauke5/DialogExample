/**
 * ## Scrollable
 * makles its content scrollable in vertical direction
 *
 * ## Example
 * ```
 * function Example() {
 *    return <Card><Scrollable>
 *       {Array(25).fill('Lore Ipsum...').map((c,i)=><div key={i}>{`row ${i}: ${c}`}</div>)}
 *    </Scrollable></Card>
 * }
 * ```
 * ![Card example](/examples/Scrollable.png)
 * @module
 */
import styles from './Scrollable.module.scss';
/**
 * ## Scrollable
 * renders children as a list that can be scrolled.
 * @param props component props:
 * - children: a list of `ReactNodes` to scroll over
 * - class: _optional_ css class on the encasing scrollable `div`
 */
export function Scrollable({ className, children, hasHeader, ...props }) {
    return <div className={`${styles.scrollable} ${hasHeader ? styles.header : ''} ${className ?? ''}`} {...props}>
      {children}
   </div>;
}
