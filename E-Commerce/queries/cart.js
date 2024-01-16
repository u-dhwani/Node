const FindUserInCart = 'SELECT * FROM cart WHERE user_id = $1';
const createCartQuery = 'INSERT INTO cart(user_id,amount) VALUES($1,$2)';
const createcartitem="insert into cart_item(user_id,prod_id,quantity) values($1,$2,$3)";
const updateCartAmount="UPDATE cart SET amount = (SELECT COALESCE(SUM(p.price * ci.quantity), 0) FROM products p JOIN cart_item ci ON p.prod_id = ci.prod_id WHERE ci.user_id = cart.user_id GROUP BY ci.user_id) WHERE EXISTS (SELECT 1 FROM cart_item ci WHERE ci.user_id = cart.user_id)";
//const updateCartAmount="UPDATE cart SET amount = ( SELECT COALESCE(SUM(p.price * ci.quantity), 0) FROM products p JOIN cart_item ci ON p.prod_id = ci.prod_id WHERE ci.user_id = $1 GROUP BY ci.user_id) WHERE EXISTS (SELECT 1 FROM cart_item ciWHERE ci.user_id = $1)";
const deleteProdfromCart="DELETE FROM cart_item WHERE user_id = $1 AND prod_id = $2";
const checkProductBygetUser="select * from cart_item where user_id=$1 and prod_id=$2";
const checkUserInCartItem="select * from cart_item where user_id=$1";
const updateCartAmountAfterDelete="update cart set amount=0 where user_id=$1";
const getAllProductsInCart="SELECT * FROM cart JOIN cart_item ON cart.user_id = cart_item.user_id WHERE cart.user_id = $1";
const updateQuantity="update cart_item set quantity=$1 where cart_item.user_id=$2 and cart_item.prod_id=$3";

module.exports={
    FindUserInCart,
    createCartQuery,
    createcartitem,
    updateCartAmount,
    checkProductBygetUser,
    deleteProdfromCart,
    checkUserInCartItem,
    updateCartAmountAfterDelete,
    getAllProductsInCart,
    updateQuantity
}

// select group by user_id