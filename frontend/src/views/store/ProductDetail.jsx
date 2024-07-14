import {useState, useEffect, useContext} from 'react'
import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import apiInstance from '../../utils/axios'
import GetCurrentAddress from '../plugin/UserCountry'
import UserData from '../plugin/UserData'
import CardID from '../plugin/CardID'
import Swal from 'sweetalert2'
import moment from 'moment'
import { CartContext } from '../plugin/Context'
import { Helmet } from 'react-helmet-async'

const Toast = Swal.mixin ({
    toast: true,
    position: "top",
    showConfirmButton:false,
    timer:1500,
    timerProgressBar: true
})

function ProductDetail() {
    const[product, setProduct] = useState({})
    const[specifications, setSpecifications] = useState([])
    const[gallery, setGallery] = useState([])
    const[color, setColor] = useState([])
    const[size, setSize] = useState([])

    const[colorValue, setColorValue] = useState("No Color")
    const[sizeValue, setSizeValue] = useState("No Size")
    const[qtyValue, setQtyValue] = useState(1)

    const [reviews, setReviews] = useState([])
    const [createReview, setCreateReview] = useState({
        user_id: 0, product_id: product?.id, review: "", rating: 0
    })

    const [cartCount, setCartCount] = useContext(CartContext)

    const param = useParams()
    const currentAddress = GetCurrentAddress()
    const userData = UserData()
    const cart_id = CardID()

    const [vendor, setVendor] = useState([])
    const [vendorUser, setVendorUser] = useState([])

    useEffect(() => {
        apiInstance.get(`products/${param.slug}/`).then((res) => {
            setProduct(res.data)
            setSpecifications(res.data.specification)
            setGallery(res.data.gallery)
            setColor(res.data.color)
            setSize(res.data.size)
            setVendor(res.data.vendor)
            setVendorUser(res.data.vendor.user)
        })
    }, [])

    console.log(vendor);

    const handleColorButtonClick = (event) => {
        const colorNameInput = event.target.closest('.color_button').parentNode.querySelector(".color_name")
        setColorValue(colorNameInput.value)
    }

    const handleSizeButtonClick = (event) => {
        const sizeNameInput = event.target.closest('.size_button').parentNode.querySelector(".size_name")
        setSizeValue(sizeNameInput.value)
    }

    const handleQuantityChange = (event) =>{
        setQtyValue(event.target.value)
    }


    const handleAddToCart = async () => {
        try {
            const formdata = new FormData()

            formdata.append("product_id", product.id)
            formdata.append('user_id', userData?.user_id)
            formdata.append('qty', qtyValue)
            formdata.append('price', product.price)
            formdata.append("shipping_amount", product.shipping_amount)
            formdata.append("country", currentAddress.country)
            formdata.append("size", sizeValue)
            formdata.append("color", colorValue)
            formdata.append("cart_id", cart_id)

            // Make a post request to the cart api view
            const response = await apiInstance.post(`cart-view/`, formdata)
            
            //Fetch updated cart items
            const url = userData ? `cart-list/${cart_id}/${userData?.user_id}/` : `cart-list/${cart_id}/`
            await apiInstance.get(url).then((res) => {
                setCartCount(res.data.length)
            })

            Toast.fire({
                icon: "success",
                title: response.data.message
                })

        } catch (error) {
            console.log(error);
        }
    }

    const fetchReviewData = async () => {
        await apiInstance.get(`reviews/${product?.id}/`).then((res) => {
            setReviews(res.data)    
        })
    }

    useEffect(() => {
        fetchReviewData()
    }, [product])

    const handleReviewChange = (event) => {
        setCreateReview({
            ...createReview,
            [event.target.name]: event.target.value
        })
    }

    const handleReviewSubmit = async (e) => {
        e.preventDefault()

        const formdata = new FormData()
        formdata.append('user_id', userData?.user_id)
        formdata.append('product_id', product?.id)
        formdata.append('rating', createReview.rating)
        formdata.append('review', createReview.review)

        await apiInstance.post(`reviews/${product?.id}/`, formdata).then((res) => {
            fetchReviewData()
        })
    }
    
  return (
    <main className="mb-4 mt-4">
        <Helmet>
        <title>{product?.title}</title>
      </Helmet>
        <div className="container">
            {/*Product details */}
            <section className="mb-9">
                <div className="row gx-lg-5">
                    <div className="col-md-6 mb-4 mb-md-0">
                        {/* Gallery */}
                        <div className="">
                            <div className="row gx-2 gx-lg-3">
                                <div className="col-12 col-lg-12">
                                    <div className="lightbox">
                                        <img
                                            src={product.image}
                                            style={{
                                                width: 300,
                                                height: 600,
                                            }}
                                            alt="Gallery image 1"
                                            className="ecommerce-gallery-main-img active w-100 rounded-4"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 d-flex">
                                {gallery.map((g, index) => (
                                    <div className="p-3" key={index}>
                                        <img
                                            src={g.image}
                                            style={{
                                                width: 100,
                                                height: 100,
                                                objectFit: "cover",
                                                borderRadius: 10
                                            }}
                                            alt="Gallery image 1"
                                            className="ecommerce-gallery-main-img active w-100 rounded-4"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Gallery */}
                    </div>
                    <div className="col-md-6 mb-4 mb-md-0">
                        {/* Details */}
                        <div>
                            <h1 className="fw-bold mb-3">{product.title}</h1>
                            <div className="d-flex text-primary just align-items-center">
                                <ul className="mb-3 d-flex p-0" style={{ listStyle: "none" }}>
                                    <li>
                                        <i className="fas fa-star fa-sm text-warning ps-0" title="Bad" />
                                        <i className="fas fa-star fa-sm text-warning ps-0" title="Bad" />
                                        <i className="fas fa-star fa-sm text-warning ps-0" title="Bad" />
                                        <i className="fas fa-star fa-sm text-warning ps-0" title="Bad" />
                                        <i className="fas fa-star fa-sm text-warning ps-0" title="Bad" />
                                    </li>

                                    <li style={{ marginLeft: 10, fontSize: 13 }}>
                                        <a href="" className="text-decoration-none">
                                            <strong className="me-2">{reviews.rating}</strong>({reviews.length} reviews)
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <h5 className="mb-3">
                                <s className="text-muted me-2 small align-middle">${product.old_price}</s>
                                <span className="align-middle">${product.price}</span>
                            </h5>
                            <p className="text-muted">
                                {product.description}
                            </p>
                            <div className="table-responsive">
                                <table className="table table-sm table-borderless mb-0">
                                    <tbody>
                                        <tr>
                                            <th className="ps-0 w-25" scope="row">
                                                <strong>Category</strong>
                                            </th>
                                            <td>{product.category?.title}</td>
                                        </tr>
                                        {specifications.map((s, index) => (
                                            <tr key={index}>
                                                <th className="ps-0 w-25" scope="row"><strong>{s.title}</strong></th>
                                                <td>{s.content}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <hr className="my-5" />
                            <div>
                                <div className="row flex-column">
                                    {/* Quantity */}
                                    <div className="col-md-6 mb-4">
                                        <div className="form-outline">
                                            <label className="form-label" htmlFor="typeNumber"><b>Quantity</b></label>
                                            <input
                                                type="number"
                                                id="typeNumber"
                                                className="form-control quantity"
                                                min={1}
                                                value={qtyValue}
                                                onChange={handleQuantityChange}
                                            />
                                        </div>
                                    </div>
                                    {size.length > 0 && 
                                    <> 
                                    {/* Size */}
                                        <h6>Size: <span>{sizeValue}</span></h6>
                                        <div className="col-md-6 mb-4">
                                            <div className="d-flex">
                                                {size?.map((s, index) => (
                                                    <div key={index} >
                                                    <input type="hidden" className="size_name" value={s.name} id="" />
                                                        <button className='btn btn-secondary m-1 size_button' type='button' onClick={handleSizeButtonClick}>{s.name}</button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                    }
                                    {color.length > 0 && 
                                    <>
                                    {/* Colors */}
                                        <h6>Color: <span>{colorValue}</span></h6>
                                        <div className="col-md-6 mb-4">
                                            <div className="d-flex">
                                                {color?.map((c, index) => (
                                                    <div key={index}>
                                                        <input type="hidden" className="color_name" value={c.name} id="" />
                                                        <button className='btn p-3 m-1 color_button' type='button' onClick={handleColorButtonClick} style={{backgroundColor: `${c.color_code}`}}></button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                    }
                                </div>
                                <button type="button" className="btn btn-primary btn-rounded me-2" onClick={handleAddToCart}>
                                    <i className="fas fa-cart-plus me-2" /> Add to cart
                                </button>
                                <button href="#!" type="button" className="btn btn-danger btn-floating" data-mdb-toggle="tooltip" title="Add to wishlist">
                                    <i className="fas fa-heart" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <hr />
            <ul className="nav nav-pills mb-3" id="pills-tab" role="tablist">
                <li className="nav-item" role="presentation">
                    <button className="nav-link active" id="pills-home-tab" data-bs-toggle="pill" data-bs-target="#pills-home" type="button" role="tab" aria-controls="pills-home" aria-selected="true">
                        Specifications
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button className="nav-link" id="pills-profile-tab" data-bs-toggle="pill" data-bs-target="#pills-profile" type="button" role="tab" aria-controls="pills-profile" aria-selected="false" >
                        Vendor
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button className="nav-link" id="pills-contact-tab" data-bs-toggle="pill" data-bs-target="#pills-contact" type="button" role="tab" aria-controls="pills-contact" aria-selected="false" >
                        Review
                    </button>
                </li>
            </ul>
            <div className="tab-content" id="pills-tabContent">
                <div
                    className="tab-pane fade show active"
                    id="pills-home"
                    role="tabpanel"
                    aria-labelledby="pills-home-tab"
                    tabIndex={0}
                >
                    <div className="table-responsive">
                        <table className="table table-sm table-borderless mb-0">
                            <tbody>
                                <tr>
                                    <th className="ps-0 w-25" scope="row">
                                        {" "}
                                        <strong>Category</strong>
                                    </th>
                                    <td>{product.category?.title}</td>
                                </tr>
                                <tr>
                                    <th className="ps-0 w-25" scope="row">
                                        {" "}
                                        <strong>Price</strong>
                                    </th>
                                    <td>${product.price}</td>
                                </tr>
                                <tr>
                                    <th className="ps-0 w-25" scope="row">
                                        {" "}
                                        <strong>Color</strong>
                                    </th>
                                    <td>
                                    {color.map((c, index) => (
                                        <span key={index}>
                                            {c.name}
                                            {index !== color.length - 1 ? ', ' : ''}
                                        </span>
                                    ))}
                                    </td>
                                </tr>
                                <tr>
                                    <th className="ps-0 w-25" scope="row">
                                        {" "}
                                        <strong>Size</strong>
                                    </th>
                                    <td>
                                    {size.map((s, index) => (
                                        <span key={index}>
                                            {s.name}
                                            {index !== size.length - 1 ? ', ' : ''}
                                        </span>
                                    ))}
                                    </td>
                                </tr>
                                {specifications.map((s, index) => (
                                    <tr key={index}>
                                        <th className="ps-0 w-25" scope="row"><strong>{s.title}</strong></th>
                                        <td>{s.content}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div
                    className="tab-pane fade"
                    id="pills-profile"
                    role="tabpanel"
                    aria-labelledby="pills-profile-tab"
                    tabIndex={0}
                >
                    <div className="card mb-3" style={{ maxWidth: 400 }}>
                        <div className="row g-0">
                            <div className="col-md-4">
                            <Link to={`/vendor/${product?.vendor?.slug}`}>
                                <img
                                    src={vendor?.image}
                                    style={{ height: "100%", width: "100%", objectFit: "cover" }}
                                    alt="User Image"
                                    className="img-fluid"
                                />
                            </Link>
                            </div>
                            <div className="col-md-8">
                                <div className="card-body">
                                    <h5 className="card-title">{vendor?.name}</h5>
                                    <p className="card-text">{vendor?.description}</p>
                                    {/* <div className="d-flex mb-2">
                                        <ul className="list-inline m-0">
                                            <li className="list-inline-item">
                                                <i className="fas fa-star text-primary" />
                                            </li>
                                            <li className="list-inline-item">
                                                <i className="fas fa-star text-primary" />
                                            </li>
                                            <li className="list-inline-item">
                                                <i className="fas fa-star text-primary" />
                                            </li>
                                            <li className="list-inline-item">
                                                <i className="fas fa-star text-primary" />
                                            </li>
                                            <li className="list-inline-item">
                                                <i className="fas fa-star-half-alt text-primary" />
                                            </li>
                                        </ul>
                                        <span className="ms-2">4.5</span>
                                    </div> */}
                                    {/* <button className="btn btn-primary me-2">Follow</button>
                                    <button className="btn btn-secondary">Send Message</button> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    className="tab-pane fade"
                    id="pills-contact"
                    role="tabpanel"
                    aria-labelledby="pills-contact-tab"
                    tabIndex={0}
                >
                    <div className="container mt-5">
                        <div className="row">
                            {/* Column 1: Form to create a new review */}
                            <div className="col-md-6">
                                <h2>Create a New Review</h2>
                                <form onSubmit={handleReviewSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="username" className="form-label">
                                            Rating
                                        </label>
                                        <select name="rating" onChange={handleReviewChange} className='form-select' id="">
                                            <option value="1">1 Star</option>
                                            <option value="2">2 Star</option>
                                            <option value="3">3 Star</option>
                                            <option value="4">4 Star</option>
                                            <option value="5">5 Star</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="reviewText" className="form-label">
                                            Review
                                        </label>
                                        <textarea
                                            className="form-control"
                                            id="reviewText"
                                            rows={4}
                                            name='review'
                                            placeholder="Write your review"
                                            defaultValue={""}
                                            value={createReview.review}
                                            onChange={handleReviewChange}
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary">
                                        Submit Review
                                    </button>
                                </form>
                            </div>
                            {/* Column 2: Display existing reviews */}
                            <div className="col-md-6">
                                <h2>Existing Reviews</h2>
                                <div className="mb-3">
                                    {reviews?.map((r, index) => (
                                    <div className="row border p-2 g-0" key={index}>
                                        <div className="col-md-3">
                                            <img
                                                src={r.profile?.image}
                                                alt="User Image"
                                                className="img-fluid"
                                            />
                                        </div>
                                        <div className="col-md-9">
                                            <div className="card-body">
                                                <h5 className="card-title">{r.profile.full_name}</h5>
                                                <p className="card-text">{moment(r.date).format("MMM D, YYYY")}</p>
                                                <p className="card-text">
                                                    {r.review} <br />
                                                    {r.rating === 1 &&
                                                        <i className='fas fa-star'></i>
                                                    }
                                                    {r.rating === 2 &&
                                                        <>
                                                            <i className='fas fa-star'></i>
                                                            <i className='fas fa-star'></i>
                                                        </>
                                                    }
                                                    {r.rating === 3 &&
                                                        <>
                                                            <i className='fas fa-star'></i>
                                                            <i className='fas fa-star'></i>
                                                            <i className='fas fa-star'></i>
                                                        </>
                                                    }
                                                    {r.rating === 4 &&
                                                        <>
                                                            <i className='fas fa-star'></i>
                                                            <i className='fas fa-star'></i>
                                                            <i className='fas fa-star'></i>
                                                            <i className='fas fa-star'></i>
                                                        </>
                                                    }
                                                    {r.rating === 5 &&
                                                        <>
                                                            <i className='fas fa-star'></i>
                                                            <i className='fas fa-star'></i>
                                                            <i className='fas fa-star'></i>
                                                            <i className='fas fa-star'></i>
                                                            <i className='fas fa-star'></i>
                                                        </>
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
  )
}

export default ProductDetail