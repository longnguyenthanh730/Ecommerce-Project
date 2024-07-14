import React, { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import apiInstance from '../../utils/axios'
import UserData from '../plugin/UserData'
import Swal from 'sweetalert2'
import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

function EditCoupon() {
    const [coupon, setCoupon] = useState([])

    const userData = UserData()
    const param = useParams()

    useEffect(() => {
        apiInstance.get(`vendor/coupon/${userData?.vendor_id}/${param.coupon_id}/`).then((res) => {
        setCoupon(res.data)
        console.log(res.data);
        })
    }, [])

    const hanldeCouponChange = (event) => {
        setCoupon({
            ...coupon,
            [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value
        })
    }

    const handleUpdateCoupon = async (e) => {
        e.preventDefault()

        const formdata = new FormData()

        formdata.append('vendor_id', userData?.vendor_id)
        formdata.append('code', coupon.code)
        formdata.append('discount', coupon.discount)
        formdata.append('active', coupon.active)

        await apiInstance.patch(`vendor/coupon/${userData?.vendor_id}/${param.coupon_id}/`, formdata).then((res) => {
            console.log(res.data);
        })

        Swal.fire({
            icon: 'success',
            title: 'Coupon Updated!'
        })
    }


  return (
    <div className="container-fluid" id="main" >
        <Helmet>
        <title>Edit Coupon</title>
        </Helmet>
        <div className="row row-offcanvas row-offcanvas-left h-100">
            <Sidebar/>
            <div className="col-md-9 col-lg-10 main mt-4">
                <h4 className="mt-3 mb-4"><i className="bi bi-tag" /> Coupons</h4>
                <form onSubmit={handleUpdateCoupon} className='card shadow p-3'>
                    <div className="mb-3">
                        <label htmlFor="exampleInputEmail1" className="form-label">
                            Code
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="exampleInputEmail1"
                            aria-describedby="emailHelp"
                            name='code'
                            placeholder='Enter Coupon Code'
                            value={coupon.code}
                            onChange={hanldeCouponChange}
                        />
                        <div id="emailHelp" className="form-text">
                            E.g COUPONCODE
                        </div>
                    </div>
                    <div className="mb-3 mt-4">
                        <label htmlFor="exampleInputPassword1" className="form-label">
                            Discount
                        </label>
                        <input
                            type="number"
                            className="form-control"
                            id="exampleInputPassword1"
                            name='discount'
                            placeholder='Enter Discount'
                            value={coupon.discount}
                            onChange={hanldeCouponChange}
                        />
                        <div id="emailHelp" className="form-text">
                            NOTE: Discount is in <b>percentage</b>
                        </div>
                    </div>
                    <div className="mb-3 form-check">
                        <input checked={coupon.active} onChange={hanldeCouponChange} name='active' type="checkbox" className="form-check-input" id="exampleCheck1" />
                        <label className="form-check-label" htmlFor="exampleCheck1">
                            Activate Coupon
                        </label>
                    </div>
                    <div className="d-flex">
                        <Link to="/vendor/coupon/" className="btn btn-secondary">
                            <i className='fas fa-arrow-left'></i> Go Back
                        </Link>
                        <button type="submit" className="btn btn-success ms-2">
                            Update Coupon <i className='fas fa-check-circle'></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div >
  )
}

export default EditCoupon