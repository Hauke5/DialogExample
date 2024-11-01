import { LayoutProps }  from '@hauke5/lib/apps'
import { TitleBar }     from "@hauke5/components/TitleBar/TitleBar";
import styles           from './examples.module.scss'

export default function ExampleLayout({children}:LayoutProps) {
   return <div className={styles.exampleLayout}>
      <TitleBar auth={false}/>
      {children}
   </div>
}