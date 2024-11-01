/**
 * ## Card
 * provides a foreground content with a backdrop shadow
 *
 * ## Example
 * ```
 * function CompCard() {
 *    return <Card>
 *       {Array(5).fill('Lore Ipsum...').map((c,i)=><div key={i}>{c}</div>)}
 *    </Card>
 * }
 * ```
 * ![Card example](/examples/Card.png)
 *
 * @module
 */
import styles from './Card.module.scss';
/**
 * ## CardComp
 * renders children inside a Card with a shadow border.
 * @param props children: list of `divs`
 */
export function Card({ children, className, ...others }) {
    return <div className={`${styles.cardFrame}`} {...others}>
      <div className={`${styles.card} ${className ?? ''}`}>
        {children}
      </div>
    </div>;
}
