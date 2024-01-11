const addProducts="insert into products(product_name, description, brand, price, category, seller_id) values($1,$2,$3,$4,$5,$6)";
const getAllProducts="select * from products";
const getProductById="select * from products where prod_id=$1";
const getProductByCategory="select * from products where category=$1";
const deleteProduct="delete from products where prod_id=$1";
const updateProductsByQuantity="update seller set quantity=$1 where seller_id=$2 and prod_id=$3";
const finalPrice="SELECT p.price * ((100 - s.discount_percentage) / 100) AS final_amount, p.price as initial_amount FROM products p NATURAL JOIN seller s WHERE p.prod_id = $1";
const existingProduct="SELECT * FROM products WHERE product_name = $1 AND seller_id = $3 AND brand = $2";


module.exports={
    addProducts,
    getAllProducts,
    getProductById,
    getProductByCategory,
    deleteProduct,
    updateProductsByQuantity,
    finalPrice,
    existingProduct

}