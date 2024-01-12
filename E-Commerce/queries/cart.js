const FindUserInCart = 'SELECT * FROM cart WHERE email = $1';
const createCartQuery = 'INSERT INTO cart(email,amount) VALUES($1,$2)';
const createcartitem="insert into cart_item(email,prod_id,quantity) values($1,$2,$3)";
const updateCartAmount="UPDATE cart SET amount = (SELECT COALESCE(SUM(p.price * ci.quantity), 0) FROM products p JOIN cart_item ci ON p.prod_id = ci.prod_id WHERE ci.email = cart.email GROUP BY ci.email) WHERE EXISTS (SELECT 1 FROM cart_item ci WHERE ci.email = cart.email)";
//const updateCartAmount="UPDATE cart SET amount = ( SELECT COALESCE(SUM(p.price * ci.quantity), 0) FROM products p JOIN cart_item ci ON p.prod_id = ci.prod_id WHERE ci.email = $1 GROUP BY ci.email) WHERE EXISTS (SELECT 1 FROM cart_item ciWHERE ci.email = $1)";
const deleteProdfromCart="DELETE FROM cart_item WHERE email = $1 AND prod_id = $2";
const checkProductByEmail="select * from cart_item where email=$1 and prod_id=$2";
const checkUserInCartItem="select * from cart_item where email=$1";
const updateCartAmountAfterDelete="update cart set amount=0 where email=$1";
const getAllProductsInCart="SELECT * FROM cart JOIN cart_item ON cart.email = cart_item.email WHERE cart.email = $1";
const updateQuantity="update cart_item set quantity=$1 where cart_item.email=$2 and cart_item.prod_id=$3";

module.exports={
    FindUserInCart,
    createCartQuery,
    createcartitem,
    updateCartAmount,
    checkProductByEmail,
    deleteProdfromCart,
    checkUserInCartItem,
    updateCartAmountAfterDelete,
    getAllProductsInCart,
    updateQuantity
}

// select group by email