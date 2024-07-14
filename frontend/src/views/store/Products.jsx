import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import apiInstance from '../../utils/axios'
import GetCurrentAddress from '../plugin/UserCountry'
import UserData from '../plugin/UserData'
import CardID from '../plugin/CardID'
import Swal from 'sweetalert2'
import { CartContext } from '../plugin/Context'
import { FaShoppingCart } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async'

const Toast = Swal.mixin ({
    toast: true,
    position: "top",
    showConfirmButton:false,
    timer:1500,
    timerProgressBar: true
})

function Products() {
    const [products, setProducts] = useState([])
    const [category, setCategory] = useState([])


    const [colorValue, setColorValue] = useState("No Color")
    const [sizeValue, setSizeValue] = useState("No Size")
    const [qtyValue, setQtyValue] = useState(1)

    const [featuredProducts, setFeaturedProducts] = useState([])
    const itemsPerPage = 6;
    const [currentPage, setCurrentPage] = useState(1);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(products.length / itemsPerPage);
    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);
    useEffect(() => {
        apiInstance.get('featured-products/').then((response) => {
            setFeaturedProducts(response.data)
        })
    }, [])

    const [selectedProduct, setSelectedProduct] = useState(null)
    const [selectedColors, setSelectedColors] = useState({})
    const [selectedSize, setSelectedSize] = useState({});

    const [cartCount, setCartCount] = useContext(CartContext)

    const currentAddress = GetCurrentAddress()
    const userData = UserData()
    const cart_id = CardID()


    const handleColorButtonClick = (event, product_id, colorName) => {
        setColorValue(colorName)
        setSelectedProduct(product_id)

        setSelectedColors((prevSelectedColors) => ({
            ...prevSelectedColors,
            [product_id]: colorName,
        }))
    }


    const handleSizeButtonClick = (event, product_id, sizeName) => {
        setSizeValue(sizeName)
        setSelectedProduct(product_id)

        setSelectedSize((prevSelectedSize) => ({
            ...prevSelectedSize,
            [product_id]: sizeName,
        }))
    }
        
    const handleQtyChange = (event, product_id) => {
        setQtyValue(event.target.value)
        setSelectedProduct(product_id)
    }



    useEffect(()=>{
        apiInstance.get(`products/`).then((response) => {
            setProducts(response.data)
        })
    }, [])

    useEffect(()=>{
        apiInstance.get(`category/`).then((res) => {
            setCategory(res.data)
        })
    }, [])


    const handleAddToCart = async (product_id, price, shipping_amount) => {
        const formdata = new FormData()

        formdata.append("product_id", product_id)
        formdata.append('user_id', userData?.user_id)
        formdata.append('qty', qtyValue)
        formdata.append('price', price)
        formdata.append("shipping_amount", shipping_amount)
        formdata.append("country", currentAddress.country)
        formdata.append("size", sizeValue)
        formdata.append("color", colorValue)
        formdata.append("cart_id", cart_id)

        const response = await apiInstance.post(`cart-view/`, formdata)

        Toast.fire({
        icon: "success",
        title: response.data.message
        })

        const url = userData ? `cart-list/${cart_id}/${userData?.user_id}/` : `cart-list/${cart_id}/`
        apiInstance.get(url).then((res) => {
            setCartCount(res.data.length)
        })
    }

    const addToWishlist = async (productId, userId) =>{
        try { 
            const formdata = new FormData()
            formdata.append('product_id', productId)
            formdata.append('user_id', userId)
            
            const response = await apiInstance.post(`customer/wishlist/${userId}/`, formdata)

            Swal.fire({
                icon: 'success',
                title: response.data.message,
            })
        } catch (error) {
            console.log(error);
        }
    }
    
    return (
        <>
            <Helmet>
            <title>Home Page</title>
            </Helmet>
            <div>
                <main className="mt-5">
                    <div className="container">
                        <section className="text-center container">
                            <div className="row mt-4 mb-3">
                                <div className="col-lg-6 col-md-8 mx-auto">
                                    <h1 className="fw-light">Hot Category🔥</h1>
                                    <p className="lead text-muted">
                                        Our Latest Categories
                                    </p>
                                </div>
                            </div>
                        </section>
                        <div className="d-flex justify-content-center">
                            {category.map((c, index) => (
                                <div key={index} className="align-items-center d-flex flex-column" style={{ background: "#e8e8e8", marginLeft: "10px", borderRadius: "10px", padding: "30px" }}>
                                    <img src={c.image}
                                        alt=""
                                        style={{ width: "90px", height: "60px" }}
                                    />
                                    <p><a href="" className='text-dark'>{c.title}</a></p>
                                </div>
                            ))}
                        </div>
    
                        <section className="text-center container">
                            <div className="row mt-4 mb-3">
                                <div className="col-lg-6 col-md-8 mx-auto">
                                    <h1 className="fw-light">Featured Products 📍</h1>
                                    <p className="lead text-muted">
                                        Our Featured Products
                                    </p>
                                </div>
                            </div>
                        </section>
                        <section className="text-center">
                            <div className="row">
                                {currentItems.map((product, index) => (
                                    <div className="col-lg-4 col-md-12 mb-4" key={index}>
                                        <div className="card">
                                            <div
                                                className="bg-image hover-zoom ripple"
                                                data-mdb-ripple-color="light"
                                            >
                                                <Link to={`/detail/${product.slug}`}>
                                                    <img
                                                        src={product?.image}
                                                        className="w-100"
                                                        style={{ width: "100px", height: "400px"}}
                                                    />
                                                </Link>
                                            </div>
                                            <div className="card-body">
                                                <h6 className="">By: <Link to={`/vendor/${product?.vendor?.slug}`}>{product.vendor.name}</Link></h6>
                                                <Link to={`/detail/${product.slug}`} className="text-reset">
                                                    <h5 className="card-title mb-3 ">{product.title.slice(0, 30)}...</h5>
                                                </Link>
                                                <Link to="/" className="text-reset">
                                                    <p>{product?.title}</p>
                                                </Link>
                                                <h6 className="mb-1">${product.price}</h6>
    
                                                {((product.color && product.color.length > 0) || (product.size && product.size.length > 0)) ? (
                                                    <div className="btn-group">
                                                        <button className="btn btn-primary dropdown-toggle" type="button" id="dropdownMenuClickable" data-bs-toggle="dropdown" data-bs-auto-close="false" aria-expanded="false">
                                                            Variation
                                                        </button>
                                                        <ul className="dropdown-menu" style={{ maxWidth: "400px" }} aria-labelledby="dropdownMenuClickable">
                                                            {/* Quantity */}
                                                            <div className="d-flex flex-column mb-2 mt-2 p-1">
                                                                <div className="p-1 mt-0 pt-0 d-flex flex-wrap">
                                                                    <>
                                                                        <li>
                                                                            <input
                                                                                type="number"
                                                                                className='form-control'
                                                                                placeholder='Quantity'
                                                                                onChange={(e) => handleQtyChange(e, product.id)}
                                                                                min={1}
                                                                                defaultValue={1}
                                                                            />
                                                                        </li>
                                                                    </>
                                                                </div>
                                                            </div>
    
                                                            {/* Size */}
                                                            {product?.size && product?.size.length > 0 && (
                                                                <div className="d-flex flex-column">
                                                                    <li className="p-1"><b>Size</b>: {selectedSize[product.id] || 'Select a size'}</li>
                                                                    <div className="p-1 mt-0 pt-0 d-flex flex-wrap">
                                                                        {product?.size?.map((size, index) => (
                                                                            <>
                                                                                <li key={index}>
                                                                                    <button
                                                                                        className="btn btn-secondary btn-sm me-2 mb-1"
                                                                                        onClick={(e) => handleSizeButtonClick(e, product.id, size.name)}
                                                                                    >
                                                                                        {size.name}
                                                                                    </button>
                                                                                </li>
                                                                            </>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
    
                                                            {/* Color */}
                                                            {product.color && product.color.length > 0 && (
                                                                <div className="d-flex flex-column mt-3">
                                                                    <li className="p-1 color_name_div"><b>Color</b>: {selectedColors[product.id] || 'Select a color'}</li>
                                                                    <div className="p-1 mt-0 pt-0 d-flex flex-wrap">
                                                                        {product?.color?.map((color, index) => (
                                                                            <>
                                                                                <input key={index} type="hidden" className={`color_name${color.id}`} name="" id="" />
                                                                                <li>
                                                                                    <button
                                                                                        key={color.id}
                                                                                        className="color-button btn p-3 me-2"
                                                                                        style={{ backgroundColor: color.color_code }}
                                                                                        onClick={(e) => handleColorButtonClick(e, product.id, color.name, color.image)}
                                                                                    >
                                                                                    </button>
                                                                                </li>
                                                                            </>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
    
                                                            {/* Add To Cart */}
                                                            <div className="d-flex mt-3 p-1 w-100">
                                                                <button
                                                                    onClick={() => handleAddToCart(product.id, product.price, product.shipping_amount)}
                                                                    type="button"
                                                                    className="btn btn-primary me-1 mb-1"
                                                                >
                                                                    Add to Cart <FaShoppingCart />
                                                                </button>
                                                            </div>
                                                        </ul>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleAddToCart(product.id, product.price, product.shipping_amount)}
                                                        type="button"
                                                        className="btn btn-primary me-1 mb-1"
                                                    >
                                                        Add to Cart <FaShoppingCart />
                                                    </button>
                                                )}
    
                                                {/* Wishlist Button */}
                                                <button
                                                    type="button"
                                                    className="btn btn-danger px-3 me-1 ms-2"
                                                    onClick={() => addToWishlist(product.id, userData?.user_id)}
                                                >
                                                    <i className="fas fa-heart" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                        <nav className='d-flex  gap-1 pt-2'>
                            <ul className='pagination'>
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                                        <i className="ci-arrow-left me-2" />
                                        Previous
                                    </button>
                                </li>
                            </ul>
                            <ul className="pagination">
                                {pageNumbers.map((number) => (
                                    <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                                        <button className="page-link" onClick={() => setCurrentPage(number)}>
                                            {number}
                                        </button>
                                    </li>
                                ))}
                            </ul>
    
                            <ul className="pagination">
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                                        Next
                                        <i className="ci-arrow-right ms-3" />
                                    </button>
                                </li>
                            </ul>
                        </nav>
                        <div>
                            <div className="d-block mt-5" aria-label="Page navigation" >
                                <span className="fs-sm text-muted me-md-3">Page <b>{currentPage} </b> of <b>{totalPages}</b></span>
                            </div>
                            {totalPages !== 1 &&
                                <div className="d-block mt-2" aria-label="Page navigation" >
                                    <span className="fs-sm text-muted me-md-3">Showing <b>{itemsPerPage}</b> of <b>{products?.length}</b> records</span>
                                </div>
                            }
                        </div>
                    </div>
                </main>
    
                <main>
                    <section className="text-center container">
                        <div className="row mt-4 mb-3">
                            <div className="col-lg-6 col-md-8 mx-auto">
                                <h1 className="fw-light">Category</h1>
                                <p className="lead text-muted">
                                    Our Latest Categories
                                </p>
                            </div>
                        </div>
                    </section>
                    <div className="d-flex justify-content-center">
                        {category.map((c, index) => (
                            <div key={index} className="align-items-center d-flex flex-column" style={{ background: "#e8e8e8", marginLeft: "10px", borderRadius: "10px", padding: "30px" }}>
                                <img src={c.image}
                                    alt=""
                                    style={{ width: "90px", height: "60px"}}
                                />
                                <p><a href="" className='text-dark'>{c.title}</a></p>
                            </div>
                        ))}
                    </div>
                    <section className="text-center container mt-5">
                        <div className="row py-lg-5">
                            <div className="col-lg-6 col-md-8 mx-auto">
                                <h1 className="fw-light">Trending Products</h1>
                                <p className="lead text-muted">
                                    Something short and leading about the collection below—its contents
                                </p>
                            </div>
                        </div>
                    </section>
                    <div className="album py-5 bg-light">
                        <div className="container">
                        <section className="text-center">
                            <div className="row">
                                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
                                    {featuredProducts.map((product, index) => (
                                        <div className="col-lg-4 col-md-12 mb-4" key={index}>
                                        <div className="card">
                                            <div
                                                className="bg-image hover-zoom ripple"
                                                data-mdb-ripple-color="light"
                                            >
                                                <Link to={`/detail/${product.slug}`}>
                                                    <img
                                                        src={product?.image}
                                                        className="w-100"
                                                        style={{ width: "100px", height: "400px"}}
                                                    />
                                                </Link>
                                            </div>
                                            <div className="card-body">
                                                <h6 className="">By: <Link to={`/vendor/${product?.vendor?.slug}`}>{product.vendor.name}</Link></h6>
                                                <Link to={`/detail/${product.slug}`} className="text-reset">
                                                    <h5 className="card-title mb-3 ">{product.title.slice(0, 30)}...</h5>
                                                </Link>
                                                <Link to="/" className="text-reset">
                                                    <p>{product?.title}</p>
                                                </Link>
                                                <h6 className="mb-1">${product.price}</h6>

                                                {((product.color && product.color.length > 0) || (product.size && product.size.length > 0)) ? (
                                                    <div className="btn-group">
                                                        <button className="btn btn-primary dropdown-toggle" type="button" id="dropdownMenuClickable" data-bs-toggle="dropdown" data-bs-auto-close="false" aria-expanded="false">
                                                            Variation
                                                        </button>
                                                        <ul className="dropdown-menu" style={{ maxWidth: "400px" }} aria-labelledby="dropdownMenuClickable">
                                                            {/* Quantity */}
                                                            <div className="d-flex flex-column mb-2 mt-2 p-1">
                                                                <div className="p-1 mt-0 pt-0 d-flex flex-wrap">
                                                                    <>
                                                                        <li>
                                                                            <input
                                                                                type="number"
                                                                                className='form-control'
                                                                                placeholder='Quantity'
                                                                                onChange={(e) => handleQtyChange(e, product.id)}
                                                                                min={1}
                                                                                defaultValue={1}
                                                                            />
                                                                        </li>
                                                                    </>
                                                                </div>
                                                            </div>

                                                            {/* Size */}
                                                            {product?.size && product?.size.length > 0 && (
                                                                <div className="d-flex flex-column">
                                                                    <li className="p-1"><b>Size</b>: {selectedSize[product.id] || 'Select a size'}</li>
                                                                    <div className="p-1 mt-0 pt-0 d-flex flex-wrap">
                                                                        {product?.size?.map((size, index) => (
                                                                            <>
                                                                                <li key={index}>
                                                                                    <button
                                                                                        className="btn btn-secondary btn-sm me-2 mb-1"
                                                                                        onClick={(e) => handleSizeButtonClick(e, product.id, size.name)}
                                                                                    >
                                                                                        {size.name}
                                                                                    </button>
                                                                                </li>
                                                                            </>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Color */}
                                                            {product.color && product.color.length > 0 && (
                                                                <div className="d-flex flex-column mt-3">
                                                                    <li className="p-1 color_name_div"><b>Color</b>: {selectedColors[product.id] || 'Select a color'}</li>
                                                                    <div className="p-1 mt-0 pt-0 d-flex flex-wrap">
                                                                        {product?.color?.map((color, index) => (
                                                                            <>
                                                                                <input key={index} type="hidden" className={`color_name${color.id}`} name="" id="" />
                                                                                <li>
                                                                                    <button
                                                                                        key={color.id}
                                                                                        className="color-button btn p-3 me-2"
                                                                                        style={{ backgroundColor: color.color_code }}
                                                                                        onClick={(e) => handleColorButtonClick(e, product.id, color.name, color.image)}
                                                                                    >
                                                                                    </button>
                                                                                </li>
                                                                            </>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Add To Cart */}
                                                            <div className="d-flex mt-3 p-1 w-100">
                                                                <button
                                                                    onClick={() => handleAddToCart(product.id, product.price, product.shipping_amount)}
                                                                    type="button"
                                                                    className="btn btn-primary me-1 mb-1"
                                                                >
                                                                    Add to Cart <FaShoppingCart />
                                                                </button>
                                                            </div>
                                                        </ul>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleAddToCart(product.id, product.price, product.shipping_amount)}
                                                        type="button"
                                                        className="btn btn-primary me-1 mb-1"
                                                    >
                                                        Add to Cart <FaShoppingCart />
                                                    </button>
                                                )}

                                                {/* Wishlist Button */}
                                                <button
                                                    type="button"
                                                    className="btn btn-danger px-3 me-1 ms-2"
                                                    onClick={() => addToWishlist(product.id, userData?.user_id)}
                                                >
                                                    <i className="fas fa-heart" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                        </div>
                    </div>
                </main>
            </div>
        </>
    )
    
}

export default Products