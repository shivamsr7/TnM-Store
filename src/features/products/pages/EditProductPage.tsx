import { useParams } from "react-router-dom";

import ProductForm from "../components/ProductForm";

export default function EditProductPage() {
  const { id } = useParams();

  if (!id) {
    return (
      <div className="flex h-80 items-center justify-center">
        Invalid Product ID
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <ProductForm
        mode="edit"
        productId={id}
      />
    </div>
  );
}