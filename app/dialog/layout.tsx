import { LayoutProps }  from "dialog/app/layout";
import { AppTitleBar }  from "@hauke5/lib/apps/AppTitleBar";
import styles           from './examples.module.scss'

export default function ExampleLayout({children}:LayoutProps) {
   return <div className={styles.exampleLayout}>
      <AppTitleBar auth={false}/>
      {children}
   </div>
}