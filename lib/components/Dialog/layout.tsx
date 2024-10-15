'use server'
import { ChildrenOnlyProps }  from '@/lib/components/BaseProps'
import                             './styles/globals.scss'

export interface LayoutProps extends ChildrenOnlyProps {
}


export default async function RootLayout({children}: LayoutProps) {
   return <html lang="en">
      <body>
         {children}
      </body>
   </html>
}
