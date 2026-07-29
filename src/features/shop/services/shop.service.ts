import { productService } from "@/features/products/services/product.service";


export const shopService = {

async getProducts(){

const products = await productService.getAll();


return products.filter(
(product:any)=>
product.status==="active"
);

},

async getProductBySlug(slug:string){

const products = await productService.getAll();


const product = products.find(

(product:any)=>

product.slug===slug

&&

product.status==="active"

);


return product;

}

};

