import React, { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import apiInstance from '../../utils/axios'
import UserData from '../plugin/UserData'
import Swal from 'sweetalert2'
import { Link } from 'react-router-dom'

function Coupon() {
    const [statsCoupon, setStatsCoupon] = useState([])
    const [coupons, setCoupons] = useState([])
    const [createCoupon, setCreateCoupon] = useState({
        code: "",
        discount: "",
        active: true,
    })

    const userData = UserData()

    const fetchCouponData = async () => {
        await apiInstance.get(`vendor/coupon-stats/${userData?.vendor_id}/`).then((res) => {
            setStatsCoupon(res.data[0])
        })

        await apiInstance.get(`vendor/coupon-list/${userData?.vendor_id}/`).then((res) => {
            setCoupons(res.data)
        })
    }

    useEffect (() => {
        fetchCouponData()
    }, [])

    const handleDeleteCoupon = async (couponId) => {
        await apiInstance.delete(`vendor/coupon/${userData?.vendor_id}/${couponId}/`)
        fetchCouponData()
    }

    const hanldeCouponChange = (event) => {
        setCreateCoupon({
            ...createCoupon,
            [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value
        })
    }

    const handleCreateCoupon = async (e) => {
        e.preventDefault()

        const formdata = new FormData()

        formdata.append('vendor_id', userData?.vendor_id)
        formdata.append('code', createCoupon.code)
        formdata.append('discount', createCoupon.discount)
        formdata.append('active', createCoupon.active)

        await apiInstance.post(`vendor/coupon-list/${userData?.vendor_id}/`, formdata).then((res) => {
            console.log(res.data);
        })

        fetchCouponData()
        Swal.fire({
            icon: 'success',
            title: 'Coupon Created!'
        })
    }

  return (
    <>
        <div className="container-fluid" id="main">
            <div className="row row-offcanvas row-offcanvas-left h-100">
                <Sidebar />
                <div className="col-md-9 col-lg-10 main mt-4">
                    <div className="row mb-3">
                        <div className="col-xl-6 col-lg-6 mb-2">
                            <div className="card card-inverse card-success">
                                <div className="card-block bg-success p-3">
                                    <div className="rotate">
                                    </div>
                                        <h6 className="text-uppercase">Total Coupons</h6>
                                        <h1 className="display-1">{statsCoupon.total_coupons}</h1>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-6 col-lg-6 mb-2">
                            <div className="card card-inverse card-danger">
                                <div className="card-block bg-danger p-3">
                                    <div className="rotate">
                                        <i className="bi bi-check-circle fa-5x"></i>
                                    </div>
                                        <h6 className="text-uppercase">Active Coupons</h6>
                                        <h1 className="display-1">{statsCoupon.active_coupons}</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr />
                    <div className="row  container">
                        <div className="col-lg-12">
                            <h4 className="mt-3 mb-4">
                                <i className="bi bi-tag"> Coupons</i>
                            </h4>
                            <table className="table">
                                <thead className="table-dark">
                                <tr>
                                    <th scope="col">Code</th>
                                    <th scope="col">Type</th>
                                    <th scope="col">Discount</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                    {coupons?.map((c, index)=> (
                                        <tr key={index}>
                                            <td>{c.code}</td>
                                            <td>Percentage</td>
                                            <td>{c.discount}%</td>
                                            <td>
                                            {c.active === true
                                                ? 'Active'
                                                : 'In-active' 
                                            }
                                            </td>
                                            <td>
                                                <Link to={`/vendor/coupon/${c.id}/`} href="#" className="btn btn-primary mb-1 ms-2">
                                                    <i className="fas fa-edit"></i>
                                                </Link>
                                                <a onClick={() => handleDeleteCoupon(c.id)} href="#" className="btn btn-danger mb-1 ms-2">
                                                    <i className="fas fa-trash"></i>
                                                </a>
                                            </td>
                                        </tr>
                                    ))}

                                    {coupons.length < 1 &&
                                        <h5 className='mt-4 p-3'>No Coupons Yet.</h5>
                                    }
                                    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
                                        <i className='fas fa-plus'></i>Create New Coupon
                                    </button>
                                    <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                        <div class="modal-dialog">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
                                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                </div>
                                                <div class="modal-body">
                                                    <form onSubmit={handleCreateCoupon}>
                                                        <div class="mb-3">
                                                            <label for="code" class="form-label"> Code </label>
                                                            <input type="text" class="form-control" id="code" name='code' value={createCoupon.code} onChange={hanldeCouponChange} placeholder='Enter coupon code...' aria-describedby="couponCode"/>
                                                        </div>
                                                        <div class="mb-3">
                                                            <label for="discount" class="form-label"> Discount </label>
                                                            <input type="number" class="form-control" id="discount" name='discount' value={createCoupon.discount} onChange={hanldeCouponChange} placeholder='Percentage discount...' aria-describedby="discount"/>
                                                        </div>
                                                        <div class="mb-3 form-check">
                                                            <input checked={createCoupon.active} onChange={hanldeCouponChange} type="checkbox" name='active' class="form-check-input" id="active"/>
                                                            <label class="form-check-label" for="exampleCheck1">Active</label>
                                                        </div>
                                                        <button type="submit" class="btn btn-primary">Submit</button>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
  )
}

export default Coupon