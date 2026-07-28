import { productService } from "@/features/products/services/product.service";


export const shopService = {

async getProducts(){

const products = await productService.getAll();


return products.filter(
(product:any)=>
product.status==="active"
);

}

};