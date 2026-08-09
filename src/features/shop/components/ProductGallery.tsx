import {
  useState,
  useRef,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
} from "lucide-react";



interface ProductGalleryProps {

  images:{
    image_url:string;
    sort_order:number;
  }[];

  productName:string;

}







export default function ProductGallery({

images,

productName

}:ProductGalleryProps){





const [activeImage,setActiveImage]=useState(0);

const [touchStart,setTouchStart]=useState<number | null>(null);

const [loaded,setLoaded]=useState(false);

const [direction,setDirection]=useState<
"next"|"prev"|null
>(null);



const imageRef = useRef<HTMLDivElement>(null);





const imageList = [...images].sort(

(a,b)=>a.sort_order-b.sort_order

);








const changeImage=(index:number)=>{


if(index===activeImage)
return;


setDirection(

index > activeImage

?

"next"

:

"prev"

);


setLoaded(false);


setTimeout(()=>{

setActiveImage(index);

},80);



};








const nextImage=()=>{


if(imageList.length<=1)
return;


changeImage(

activeImage===imageList.length-1

?

0

:

activeImage+1

);


};








const previousImage=()=>{


if(imageList.length<=1)
return;


changeImage(

activeImage===0

?

imageList.length-1

:

activeImage-1

);


};








const handleTouchStart=(

e:React.TouchEvent

)=>{


setTouchStart(

e.touches[0].clientX

);


};







const handleTouchEnd=(

e:React.TouchEvent

)=>{


if(touchStart===null)
return;


const touchEnd =
e.changedTouches[0].clientX;



const distance =
touchStart-touchEnd;




if(Math.abs(distance)>50){


if(distance>0){

nextImage();

}
else{

previousImage();

}


}



setTouchStart(null);


};


return (

<section

className="
w-full

"

>







{/* Main Gallery */}

<div

ref={imageRef}

onTouchStart={handleTouchStart}

onTouchEnd={handleTouchEnd}


className="

relative

aspect-[4/5]

overflow-hidden

rounded-3xl

bg-neutral-900

shadow-xl


sm:aspect-square


lg:h-[560px]

lg:aspect-auto

"

>





{

imageList.length > 0 &&

<img

src={
imageList[activeImage].image_url
}

alt={productName}


onLoad={()=>setLoaded(true)}


className={`

h-full

w-full

object-cover


transition-all

duration-500

ease-out



${

loaded

?

"opacity-100 scale-100"

:

"opacity-0 scale-105"

}



${

direction==="next"

?

"translate-x-2"

:

direction==="prev"

?

"-translate-x-2"

:

""

}


`}

/>

}









{/* Image Counter Mobile */}

{

imageList.length > 1 &&

<div

className="

absolute

bottom-4

left-1/2

-translate-x-1/2

rounded-full

bg-black/60

px-3

py-1

text-xs

text-white

backdrop-blur-md

sm:hidden

"

>

{activeImage+1}/{imageList.length}

</div>

}









{/* Wishlist */}

<button

className="

absolute

right-4

top-4


flex

h-11

w-11

items-center

justify-center


rounded-full

bg-black/40


text-white


backdrop-blur-md


transition-all

duration-300


hover:scale-110

hover:bg-[#D4AF37]

hover:text-black


active:scale-95

"

>

<Heart size={21}/>

</button>









{/* Share */}

<button

className="

absolute

bottom-4

right-4


flex

h-11

w-11

items-center

justify-center


rounded-full

bg-black/40


text-white


backdrop-blur-md


transition-all

duration-300


hover:scale-110

hover:bg-[#D4AF37]

hover:text-black


active:scale-95

"

>

<Share2 size={19}/>

</button>









{/* Desktop Arrows */}

{

imageList.length > 1 &&

<>

<button

onClick={previousImage}

className="

absolute

left-4

top-1/2

hidden

h-10

w-10

-translate-y-1/2


items-center

justify-center


rounded-full

bg-black/50


text-white


backdrop-blur-md


transition


hover:bg-[#D4AF37]

hover:text-black


sm:flex

"

>

<ChevronLeft size={20}/>

</button>










<button

onClick={nextImage}

className="

absolute

right-4

top-1/2

hidden

h-10

w-10

-translate-y-1/2


items-center

justify-center


rounded-full

bg-black/50


text-white


backdrop-blur-md


transition


hover:bg-[#D4AF37]

hover:text-black


sm:flex

"

>

<ChevronRight size={20}/>

</button>





</>

}



</div>









{/* Mobile Dots */}

{

imageList.length > 1 &&

<div

className="

mt-5

flex

justify-center

gap-2

sm:hidden

"

>

{

imageList.map((_,index)=>(


<button

key={index}

onClick={()=>changeImage(index)}

className={`

rounded-full

transition-all

duration-300


${

activeImage===index

?

"h-2.5 w-7 bg-[#D4AF37]"

:

"h-2.5 w-2.5 bg-neutral-600"

}

`}

/>


))

}


</div>

}









{/* Desktop Thumbnails */}

{

imageList.length > 1 &&

<div

className="

mt-5

hidden

gap-3

sm:flex

"

>

{

imageList.map((image,index)=>(


<button

key={index}

onClick={()=>changeImage(index)}

className={`

h-20

w-20


overflow-hidden


rounded-xl


border-2


transition-all


${

activeImage===index

?

"scale-105 border-[#D4AF37]"

:

"border-transparent opacity-70 hover:opacity-100"

}

`

}

>


<img

src={image.image_url}

alt={productName}

className="

h-full

w-full

object-cover

"

/>


</button>


))

}

</div>

}





</section>

);

}