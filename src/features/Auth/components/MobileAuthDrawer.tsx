import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer";

import AuthContent from "./AuthContent";


interface Props {

  open: boolean;

  onOpenChange: (
    open: boolean
  ) => void;

}



export default function MobileAuthDrawer({

  open,

  onOpenChange,

}: Props) {


  return (

    <Drawer

      open={open}

      onOpenChange={onOpenChange}

      shouldScaleBackground

    >


      <DrawerContent

        className="
          max-h-[90vh]
        "

      >

        <AuthContent />


      </DrawerContent>


    </Drawer>

  );

}