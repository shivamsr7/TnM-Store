import {
  Heart,
  ShoppingBag,
  User,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";


import {
  useAuthDialog,
} from "@/features/Auth/context/AuthDialogContext";



interface HeaderIconsProps {

  wishlistCount?: number;

  cartCount?: number;

}



function IconBadge({
  count,
}:{
  count?:number;
}) {


  if(!count || count <= 0)
    return null;


  return (

    <span

      className="
        absolute
        -right-1
        -top-1
        flex
        h-5
        w-5
        items-center
        justify-center
        rounded-full
        bg-black
        text-[10px]
        font-semibold
        text-white
      "

    >

      {count > 99 ? "99+" : count}

    </span>

  );

}





interface IconButtonProps {

  to?: string;

  onClick?: () => void;

  children: React.ReactNode;

  label: string;

}





function IconButton({

  to,

  onClick,

  children,

  label,

}:IconButtonProps){



const className = `

relative

flex

h-11

w-11

items-center

justify-center

rounded-full

text-white

transition-all

duration-200

hover:bg-neutral-800

hover:text-[#C8A44D]

`;




if(to){

return (

<Link

  to={to}

  aria-label={label}

  className={className}

>

{children}

</Link>

);

}




return (

<button

  onClick={onClick}

  aria-label={label}

  className={className}

>

{children}

</button>

);


}







export default function HeaderIcons({

  wishlistCount = 0,

  cartCount = 0,

}:HeaderIconsProps){



const {
  openAuth,
}=useAuthDialog();




return (

<div className="flex items-center gap-2">


{/* Wishlist */}

<IconButton

  to="/wishlist"

  label="Wishlist"

>

<Heart className="h-5 w-5"/>

<IconBadge
 count={wishlistCount}
/>

</IconButton>






{/* Cart */}

<IconButton

  to="/cart"

  label="Cart"

>

<ShoppingBag className="h-5 w-5"/>

<IconBadge

 count={cartCount}

/>

</IconButton>







{/* Account */}

<IconButton

  onClick={openAuth}

  label="My Account"

>

<User className="h-5 w-5"/>


</IconButton>





</div>

);

}