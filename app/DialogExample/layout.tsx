import { AppTitleBar }  from "lib/apps/AppTitleBar";
import styles           from './examples.module.scss'
import { LayoutProps }  from '../layout'

export default function ExampleLayout({children}:LayoutProps) {
   return <div className={styles.exampleLayout}>
      <AppTitleBar auth={false}/>
      {children}
   </div>
}