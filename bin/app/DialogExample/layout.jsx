import { TitleBar } from "@hauke5/components/TitleBar/TitleBar";
import styles from './examples.module.scss';
export default function ExampleLayout({ children }) {
    return <div className={styles.exampleLayout}>
      <TitleBar auth={false}/>
      {children}
   </div>;
}
