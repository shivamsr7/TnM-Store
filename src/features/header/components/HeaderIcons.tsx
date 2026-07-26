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


import {
  useAuth,
} from "@/features/Auth/context/AuthContext";



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



const {
customer,
logout,
}=useAuth();





function handleAccount(){

if(!customer){

openAuth();

}

}





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

<div className="relative group flex items-center gap-2">


{
customer && (

<span

className="
hidden
lg:block

text-sm

font-medium

text-white

"

>

Hi, {customer.first_name} ✨

</span>

)

}



<IconButton

onClick={handleAccount}

label="My Account"

>

<User className="h-5 w-5"/>

</IconButton>




{
customer && (

<div

className="
absolute
right-0
top-12

hidden

group-hover:block

w-40

rounded-xl

border

border-neutral-800

bg-black

p-3

shadow-xl

"

>


<p

className="
text-sm
font-medium
text-white
"

>

Hi, {customer.first_name} ✨

</p>



<button

onClick={logout}

className="
mt-2
text-xs
text-neutral-400

hover:text-[#C8A44D]

"

>

Logout

</button>


</div>

)

}



</div>






</div>

);

}