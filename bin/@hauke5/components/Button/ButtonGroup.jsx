import styles from './ButtonGroup.module.scss';
export function ButtonGroup({ children, className, ...props }) {
    return <div className={`${styles.group} ${className ?? ''}`} {...props}>
      {children}
   </div>;
}
