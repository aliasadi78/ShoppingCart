const productDOM = document.querySelector('.products-center')
const cartItems = document.querySelector('.cart-items')
const cartTotal = document.querySelector('.cart-total')
const cartContent = document.querySelector('.cart-content')
const cartBtn = document.querySelector('.cart-btn')
const cartOverlay = document.querySelector('.cart-overlay')
const cartCenter = document.querySelector('.cart')
const closeCart = document.querySelector('.fa-times')
const clearBtn = document.querySelector('.clear-btn')

let cart = []

class Product {
    async getProducts() {
        try {
            const result = await fetch('./product.json')
            const data = await result.json()
            let products = []

            products = data.items.map((item) => {
                const { id } = item.sys
                const { title, price } = item.fields
                const image = item.fields.image.fields.file.url
                return { id, title, price, image }
            })
            return products
        } catch (error) {
            console.log(error)
        }
    }
}

class View {
    displayProducts(products) {
        let result = ''
        products.forEach(product => {
            result += `
            <article class="products">
                <div class="img-container">
                    <img src="${product.image}" alt="${product.title}" class="img-product"/>
                    <button class="bag-btn" data-id="${product.id}">افزودن به سبد خرید</button>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <h4>${product.price} تومان </h4>
                </div>
            </article>
        `
        });
        productDOM.innerHTML = result
    }
    getCartButtons() {
        const buttons = [...document.querySelectorAll('.bag-btn')]
        buttons.forEach((item) => {
            let id = item.dataset.id
            item.addEventListener('click', (e) => {
                let product = cart.find(item => item.id === id)
                if (product !== undefined) {
                    product.amount += 1
                    const itemAmount = document.querySelectorAll('.item-amount')
                    itemAmount.forEach((i) => i.dataset.id === id && (i.innerText = product.amount))
                } else {
                    const cartItem = { ...Storage.getProduct(id), amount: 1 }
                    cart = [...cart, cartItem]
                    this.addCartItem(cartItem)
                }
                Storage.saveCart(cart)
                this.setCartValues(cart)
                this.showCart()
            })
        })
    }
    setCartValues(cart) {
        let totalPrice = 0
        let totalItems = 0

        cart.map((item) => {
            totalPrice = totalPrice + item.price * item.amount
            totalItems = totalItems + item.amount
        })

        cartItems.innerText = totalItems
        cartTotal.innerText = totalPrice
    }
    addCartItem(item) {
        const div = document.createElement('div')
        div.classList.add('cart-item')
        div.innerHTML = `
            <img src="${item.image}" alt="${item.title}"/>
            <div>
                <h4>${item.title}</h4>
                <h5>${item.price}</h5>
                <span class="remove-item" >
                    <i class="fa-sharp fa-solid fa-trash-can remove-item" data-id=${item.id}></i>
                </span>
            </div>
            <div>
                <i class="fas fa-chevron-up" data-id=${item.id}></i>
                <p class="item-amount" data-id=${item.id}>${item.amount}</p>
                <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>
        `

        cartContent.appendChild(div)
    }
    showCart() {
        cartOverlay.classList.add('transparent-bcg')
        cartCenter.classList.add('show-cart')
    }
    hideCart() {
        cartOverlay.classList.remove('transparent-bcg')
        cartCenter.classList.remove('show-cart')
    }

    initApp() {
        cart = Storage.getCart()
        this.setCartValues(cart)
        this.populate(cart)

        cartBtn.addEventListener('click', this.showCart)
        closeCart.addEventListener('click', this.hideCart)
    }
    populate(cart) {
        cart.forEach((item) => {
            this.addCartItem(item)
        })
    }
    cartProcess() {
        cartOverlay.addEventListener('click', (event) => {
            if (event.target.classList.contains('cart-overlay')) {
                this.hideCart()
            }
        })
        clearBtn.addEventListener('click', () => {
            this.clearCart()
        })
        cartContent.addEventListener('click', (event) => {
            console.log(event.target)
            if (event.target.classList.contains('remove-item')) {
                let removeItem = event.target
                let id = removeItem.dataset.id

                cartContent.removeChild(removeItem.parentElement.parentElement.parentElement)
                this.removeProduct(id)
            }
            if (event.target.classList.contains('fa-chevron-up')) {
                let addAmount = event.target
                let id = addAmount.dataset.id
                let product = cart.find(item => item.id === id)

                product.amount += 1
                this.setCartValues(cart)
                Storage.saveCart(cart)
                addAmount.nextElementSibling.innerText = product.amount
            }
            if (event.target.classList.contains('fa-chevron-down')) {
                let lowerAmount = event.target
                let id = lowerAmount.dataset.id

                let product = cart.find(item => item.id === id)
                product.amount -= 1
                if (product.amount > 0) {
                    this.setCartValues(cart)
                    Storage.saveCart(cart)
                    lowerAmount.previousElementSibling.innerText = product.amount
                } else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement)
                    this.removeProduct(id)
                }
            }
        })
    }

    clearCart() {
        let cartItems = cart.map(item => item.id)
        cartItems.forEach(item => this.removeProduct(item))
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0])
        }
    }

    removeProduct(id) {
        cart = cart.filter(item => item.id !== id)
        this.setCartValues(cart)
        Storage.saveCart(cart)
    }
}
class Storage {
    static saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products))
    }
    static getProduct(id) {
        const products = JSON.parse(localStorage.getItem('products'))
        return products.find((item) => item.id === id)
    }
    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart))
    }
    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const products = new Product()
    const view = new View()

    view.initApp()
    products.getProducts().then((data) => {
        view.displayProducts(data)
        Storage.saveProducts(data)
    }).then(() => {
        view.getCartButtons()
        view.cartProcess()
    })
})
