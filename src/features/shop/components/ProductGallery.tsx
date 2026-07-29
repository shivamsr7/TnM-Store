import {
  useState
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2
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

const [direction,setDirection]=useState<
"next"|"prev"|null
>(null);





const imageList = images
.sort(
(a,b)=>a.sort_order-b.sort_order
);






const changeImage=(index:number)=>{

setActiveImage(index);

};







const nextImage=()=>{


if(imageList.length<=1)
return;


setDirection("next");


setTimeout(()=>{

setActiveImage(

activeImage===imageList.length-1

?

0

:

activeImage+1

);


},100);


};





const previousImage=()=>{


if(imageList.length<=1)
return;


setDirection("prev");


setTimeout(()=>{


setActiveImage(

activeImage===0

?

imageList.length-1

:

activeImage-1

);


},100);


};








return (

<section

className="
w-full

"

>



{/* Main Image */}


<div

className="
relative

aspect-square

overflow-hidden

rounded-2xl

bg-neutral-900

"

>



{

imageList.length>0 &&

<img

src={imageList[activeImage].image_url}

alt={productName}

className={`

h-full

w-full

object-cover

transition-all

duration-300


${

direction

?

"opacity-80 scale-105"

:

"opacity-100 scale-100"

}

`}

/>

}







{/* Wishlist */}

<button

className="
absolute

right-4

top-4

flex

h-10

w-10

items-center

justify-center

rounded-full

bg-black/40

text-white

backdrop-blur-sm

hover:bg-[#D4AF37]

hover:text-black

transition

"

>

<Heart size={20}/>

</button>








{/* Share */}

<button

className="
absolute

right-4

bottom-4

flex

h-10

w-10

items-center

justify-center

rounded-full

bg-black/40

text-white

backdrop-blur-sm

hover:bg-[#D4AF37]

hover:text-black

transition

"

>

<Share2 size={18}/>

</button>







{/* Arrows */}

{

imageList.length>1 &&

<>


<button

onClick={previousImage}

className="
absolute

left-3

top-1/2

-translate-y-1/2

flex

h-9

w-9

items-center

justify-center

rounded-full

bg-black/40

text-white

backdrop-blur-sm

hover:bg-[#D4AF37]

hover:text-black

transition

"

>

<ChevronLeft size={18}/>

</button>





<button

onClick={nextImage}

className="
absolute

right-3

top-1/2

-translate-y-1/2

flex

h-9

w-9

items-center

justify-center

rounded-full

bg-black/40

text-white

backdrop-blur-sm

hover:bg-[#D4AF37]

hover:text-black

transition

"

>

<ChevronRight size={18}/>

</button>


</>

}


</div>









{/* Dots */}

{

imageList.length>1 &&

<div

className="
mt-4

flex

justify-center

gap-2

"

>

{

imageList.map((_,index)=>(


<button

key={index}

onClick={()=>changeImage(index)}

className={`

h-2

w-2

rounded-full

transition


${

activeImage===index

?

"bg-[#D4AF37]"

:

"bg-neutral-500"

}

`}

/>


))

}


</div>

}









{/* Desktop thumbnails */}

{

imageList.length>1 &&

<div

className="
mt-5

hidden

sm:flex

gap-3

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

border


${

activeImage===index

?

"border-[#D4AF37]"

:

"border-transparent"

}

`}

>


<img

src={image.image_url}

alt="thumbnail"

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