import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import apiInstance from '../../utils/axios'
import { Helmet } from 'react-helmet-async'

function PaymentSuccess() {
    const [order, setOrder] = useState([])
    const [status, setStatus] = useState("Verifying")

    const param = useParams()

    const urlParam = new URLSearchParams(window.location.search)
    const sessionId = urlParam.get('session_id')
    const paypal_order_id = urlParam.get('paypal_order_id')

    useEffect(() => {
        apiInstance.get(`checkout/${param.order_oid}/`).then((res) => {
            setOrder(res.data);
        })
    }, [param])

    useEffect(() => {
        const formdata = new FormData();
        formdata.append('order_oid', param?.order_oid)
        formdata.append('session_id', sessionId)
        formdata.append('paypal_order_id', paypal_order_id)

        apiInstance.post(`payment-success/${param.order_oid}/`, formdata).then((res) => {
            if(res.data.message === "Payment Successful"){
                setStatus("Payment Successful")
            }
            if(res.data.message === "Already Paid"){
                setStatus("Already Paid")
            }
            if(res.data.message === "You Invoice Is Unpaid"){
                setStatus("You Invoice Is Unpaid")
            }
            console.log(res.data);
        })

    }, [param?.order_oid])

    return (
        <div>
            <main className="mb-4 mt-4 h-100">
            <Helmet>
            <title>Payment Success Page</title>
            </Helmet>
                <div className="container">
                {/* Section: Checkout form */}
                    <section className="">
                        <div className="gx-lg-5">
                            <div className="row pb50">
                                <div className="col-lg-12">
                                    <div className="dashboard_title_area">
                                        <h4 className="fw-bold text-center mb-4 mt-4">
                                        Payment Check <i className="fas fa-check-circle" />{" "}
                                        </h4>
                                        {/* <p class="para">Lorem ipsum dolor sit amet, consectetur.</p> */}
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-xl-12">
                                    <div className="application_statics">
                                        <div className="account_user_deails dashboard_page">
                                            <div className="d-flex justify-content-center align-items-center">
                                                {status === "Verifying" && 
                                                    <div className="col-lg-12">
                                                        <div className="border border-3 border-success"/>
                                                            <div className="card bg-white shadow p-5">
                                                                <div className="mb-4 text-center">
                                                                    <i className="fas fa-spinner fa-spin text-warning" style={{ fontSize: 100, color: "yellow" }}/>
                                                                </div>
                                                                <div className="text-center">
                                                                    <h1>Payment Verifying</h1>
                                                                    <p>
                                                                        <b className='text-success'>Please hold on, while we verify your payment</b>
                                                                        <br />
                                                                        <b className='text-danger'>NOTE: Do not reload or leave the page!</b>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                    </div>
                                                }

                                                {status === "Payment Successful" && 
                                                    <div className="col-lg-12">
                                                        <div className="border border-3 border-success"/>
                                                            <div className="card bg-white shadow p-5">
                                                                <div className="mb-4 text-center">
                                                                    <i className="fas fa-check-circle text-success" style={{ fontSize: 100, color: "green" }}/>
                                                                </div>
                                                                <div className="text-center">
                                                                    <h1>Thank You !</h1>
                                                                    <p>
                                                                        Thank you for your patronage, please note your order id <b>#{order.oid}</b> <br />
                                                                        We have sent the order detail to your email <b>({order.email})</b>
                                                                    </p>
                                                                    <button
                                                                        className="btn btn-success mt-3"
                                                                        data-bs-toggle="modal"
                                                                        data-bs-target="#exampleModal"
                                                                    >
                                                                        View Order <i className="fas fa-eye" />{" "}
                                                                    </button>
                                                                    <Link to={`/`} className="btn btn-secondary mt-3 ms-2">
                                                                        Go Home <i className="fas fa-fa-arrow-left" />{" "}
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                    </div>
                                                }

                                                {status === "You Invoice Is Unpaid" && 
                                                    <div className="col-lg-12">
                                                        <div className="border border-3 border-success"/>
                                                            <div className="card bg-white shadow p-5">
                                                                <div className="mb-4 text-center">
                                                                    <i className="fas fa-ban text-danger" style={{ fontSize: 100, color: "red" }}/>
                                                                </div>
                                                                <div className="text-center">
                                                                    <h1>Unpaid Invoice <i className='fas fa-ban'></i></h1>
                                                                    <p>
                                                                        <b className='text-danger'>Please Try Making The Payment Again !</b>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                    </div>
                                                }

                                                {status === "Already Paid" && 
                                                    <div className="col-lg-12">
                                                        <div className="border border-3 border-success"/>
                                                            <div className="card bg-white shadow p-5">
                                                                <div className="mb-4 text-center">
                                                                    <i className="fas fa-check-circle text-success" style={{ fontSize: 100, color: "green" }}/>
                                                                </div>
                                                                <div className="text-center">
                                                                    <h1>Already Paid!</h1>
                                                                    <p>
                                                                        Thank you for your patronage, please note your order id <b>#{order.oid}</b> <br />
                                                                        We have sent the order detail to your email <b>({order.email})</b>
                                                                    </p>
                                                                    <button
                                                                        className="btn btn-success mt-3"
                                                                        data-bs-toggle="modal"
                                                                        data-bs-target="#exampleModal"
                                                                    >
                                                                        View Order <i className="fas fa-eye" />{" "}
                                                                    </button>
                                                                    <Link to={`/`} className="btn btn-secondary mt-3 ms-2">
                                                                        Go Home <i className="fas fa-fa-arrow-left" />{" "}
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
            <div className="modal fade" id="exampleModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                        <h5 className="modal-title" id="exampleModalLabel">
                            Order Summary
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body text-start text-black p-4">
                                <h5
                                className="modal-title text-uppercase "
                                id="exampleModalLabel"
                                >
                                {order.full_name}
                                </h5>
                                <h6>{order.email}</h6>
                                <h6>{order.mobile}</h6>
                                <h6 className="mb-5">{order.address} - {order.city} <br /> {order.state} - {order.country}</h6>
                                <p className="mb-0" style={{ color: "#35558a" }}>
                                Payment summary
                                </p>
                                <hr
                                className="mt-2 mb-4"
                                style={{
                                    height: 0,
                                    backgroundColor: "transparent",
                                    opacity: ".75",
                                    borderTop: "2px dashed #9e9e9e"
                                }}
                                />
                                {order.orderitem?.map((o, index) => (
                                    <div className="d-flex justify-content-between shadow p-2 rounded-2 mb-2" key={index}>
                                        <p className="fw-bold mb-1">{o.product?.title}</p>
                                        <p className="text-muted mb-1">${o.price}</p>
                                    </div>    
                                ))}
                                <div className="d-flex justify-content-between">
                                <p className="small mb-1">Subtotal</p>
                                <p className="small mb-1">${order.sub_total}</p>
                                </div>
                                <div className="d-flex justify-content-between">
                                <p className="small mb-1">Shipping Fee</p>
                                <p className="small mb-1">${order.shipping_amount}</p>
                                </div>
                                <div className="d-flex justify-content-between">
                                <p className="small mb-1">Service Fee</p>
                                <p className="small mb-1">${order.service_fee}</p>
                                </div>
                                <div className="d-flex justify-content-between">
                                <p className="small mb-1">Tax</p>
                                <p className="small mb-1">${order.tax_fee}</p>
                                </div>
                                <div className="d-flex justify-content-between">
                                <p className="small mb-1">Discount</p>
                                <p className="small mb-1">-${order.saved}</p>
                                </div>
                                <div className="d-flex justify-content-between mt-4">
                                <p className="fw-bold">Total</p>
                                <p className="fw-bold" style={{ color: "#35558a" }}>
                                ${order.total}
                                </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PaymentSuccess
