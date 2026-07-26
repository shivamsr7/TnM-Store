import * as React from "react";

import {
  Drawer as DrawerPrimitive,
} from "vaul";

import { cn } from "@/lib/utils";



const Drawer = DrawerPrimitive.Root;

const DrawerTrigger =
  DrawerPrimitive.Trigger;

const DrawerClose =
  DrawerPrimitive.Close;

const DrawerPortal =
  DrawerPrimitive.Portal;




const DrawerOverlay =
React.forwardRef<

  React.ElementRef<typeof DrawerPrimitive.Overlay>,

  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>

>(

(
{
className,
...props
},
ref

)=>(


<DrawerPrimitive.Overlay

ref={ref}

className={cn(

`
fixed
inset-0
z-50
bg-black/40
`,

className

)}

{...props}

/>


)

);


DrawerOverlay.displayName =
DrawerPrimitive.Overlay.displayName;







const DrawerContent =
React.forwardRef<

React.ElementRef<typeof DrawerPrimitive.Content>,

React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>

>(

(
{
className,
children,
...props
},
ref

)=>(


<DrawerPortal>


<DrawerOverlay />


<DrawerPrimitive.Content

ref={ref}


className={cn(

`
fixed
bottom-0
left-0
right-0

z-50

flex
flex-col

rounded-t-3xl

bg-white

outline-none

touch-none
`,

className

)}


{...props}

>


{/* Drag Handle */}

<div

className="
mx-auto
mt-3
h-1.5
w-12
rounded-full
bg-neutral-300
"

/>



{children}


</DrawerPrimitive.Content>


</DrawerPortal>


)

);


DrawerContent.displayName =
DrawerPrimitive.Content.displayName;





export {

Drawer,

DrawerTrigger,

DrawerClose,

DrawerPortal,

DrawerOverlay,

DrawerContent,

};