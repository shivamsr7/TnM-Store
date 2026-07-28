import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";


export default function ScrollToTopButton(){

const [visible,setVisible] = useState(false);



useEffect(()=>{


const handleScroll = () => {

if(window.scrollY > 400){

setVisible(true);

}
else{

setVisible(false);

}

};



window.addEventListener(
"scroll",
handleScroll
);


return()=>{

window.removeEventListener(
"scroll",
handleScroll
);

};


},[]);





const scrollTop = () => {

window.scrollTo({

top:0,

behavior:"smooth"

});

};





if(!visible) return null;



return (

<button

onClick={scrollTop}

aria-label="Scroll to top"

className="

fixed

bottom-6

right-6

z-50

flex

h-11

w-11

items-center

justify-center


rounded-full


border

border-[#D4AF37]/50


bg-black/40


backdrop-blur-md


text-[#D4AF37]


shadow-[0_0_25px_rgba(212,175,55,0.25)]


transition-all

duration-300


hover:-translate-y-1


hover:bg-[#D4AF37]


hover:text-black


"

>

<ChevronUp size={22}/>

</button>

);

}