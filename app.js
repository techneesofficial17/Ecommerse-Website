const cardBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.cart-close');
const clearCardBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.product-center');


// cart 

let cart = [];
// buttons 
let buttonsDOM = [];

// getting the products first from the json file and after we are going to add the items from the contentfull
class Products {
    async getProducts() {
       try {
           let result = await fetch('products.json');
           let data = await result.json();
           let products = data.items;
           
           products = products.map(item => {
               const {title,price} = item.fields;
               const {id} = item.sys;
               const image = item.fields.image.fields.file.url;
               return {title,price,id,image}
           })
           return products;
       } catch (error) {
           console.log(error);
       }
    }

}

// display products 
class UI {
    displayProducts(products) {
        // console.log(products);
        console.log(products);
        let result = '';
        products.forEach(product => {
            result += `
            <article class="product">
            <div class="img-container">
                <img src=${product.image} alt="" class="product-img" />
                <button class="bag-btn" data-id=${product.id}>
                <i class="fas fa-shopping-cart"></i>
                add to cart
                </button>
            </div>
            <h3>${product.title}</h3>
            <h4>$ ${product.price}</h4>
            </article>
            `
        });
        productsDOM.innerHTML = result;
    }
    getBagButtons() {
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            // console.log(id);
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                button.innerText = "In Cart";
                button.disabled = true;     
            } else {
                button.addEventListener('click', (event)=> {
                    event.target.innerText = "In Cart";
                    event.target.disabled = true;
                    // get products from product 
                    let cartItem = {...Storage.getProduct(id), amount : 1};
                    console.log(cartItem);
                    // add product to the cart 
                    cart = [...cart,cartItem];
                    // console.log(cart);
                    // save cart in local storage 
                    Storage.saveCart(cart);
                    // set cart values
                    this.setCartValue(cart);
                    // display cart items
                    this.addCartItem(cartItem);
                    // show cart
                    this.showCart();
                })
                
            }
        })
        
        
    }
    setCartValue(cart){
        let tempTotal = 0;
        let itemTotal = 0;

        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemTotal += item.amount;
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemTotal;
    }
    addCartItem(item) {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
        <img src=${item.image} alt="" />
            <div>
            <h4>${item.title}</h4>
            <h5>$ ${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
            <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount" ${item.amount}>1</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>
        `;
        div.style.gridColumnStart = "initial";
        cartContent.appendChild(div);
        console.log(cartContent);
    }
    setupApp() {
        cart = Storage.getCart();
        this.setCartValue(cart);
        this.populate(cart);
        cardBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.removeCart);
    }
    populate(cart){ 
        cart.forEach(item => this.addCartItem(item));

    }
    showCart() {
        cartOverlay.classList.add('showCart');
        // cartDOM.classList.add('showCart');
    }
    removeCart() {
        cartOverlay.classList.remove('showCart');
        // cartDOM.classList.remove('showCart');
    }
    cartLogic() {
        // clearing the cart btn ! 
        clearCardBtn.addEventListener('click', () => {
            this.clearCart();
        })
        // cart functniolity 
        cartContent.addEventListener('click', event => {
            if(event.target.classList.contains('remove-item')){
                let removeItem = event.target;
                let id = removeItem.dataset.id;

                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            }else if (event.target.classList.contains('fa-chevron-up')){
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                // console.log(id);
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValue(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;

            }else if(event.target.classList.contains('fa-chevron-down')){
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if(tempItem.amount > 0){
                    Storage.saveCart(cart);
                    this.setCartValue(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                }else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id); 

                }
            }
            
            
        })

    }
    clearCart() {
        let cartItem = cart.map(item => item.id);
        cartItem.forEach(id => this.removeItem(id));

        console.log(cartContent.children);
        
        while(cartContent.children.length>0){
            cartContent.removeChild(cartContent.children[0])
        }
        this.removeCart();
    }
    removeItem(id) {
        cart = cart.filter(item => item.id !== id );
        this.setCartValue(cart);
        Storage.saveCart(cart);
        let button =this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
    }

    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);

    }

}


// local storage
class Storage {
    // we will use the static method so we do not need the instance 
    static saveProducts(products){
        localStorage.setItem("products", JSON.stringify(products))
    }

    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products'));

        // console.log(products);
        return products.find(product => product.id === id);
    }
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[];
    }

}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();
    // setup app 
    ui.setupApp();

    // get all the products 
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products)
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });
})