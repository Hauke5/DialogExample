import { ReactNode } from "react";
import                     './styles/globals.scss'

/** a layout for the example started with npx */
export default function ExampleLayout({children}:{children: ReactNode}) {
   return <html lang="en">
      <body>
         {children}
      </body>
   </html>
}