import {useState} from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import apiInstance from '../../utils/axios'


function CreatePassword() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [searchParam] = useSearchParams()
  const navigate = useNavigate()

  const otp = searchParam.get("otp")
  const uidb64 = searchParam.get("uidb64")

  const handlePasswordSubmit = async (e) => {
    setIsLoading(true)
    e.preventDefault()

    if(password !== confirmPassword){
      alert("Password Does Not Match")
      setIsLoading(false)
    } else {
      setIsLoading(true)
      const formdata = new FormData()
      formdata.append('password', password)
      formdata.append('otp', otp)
      formdata.append('uidb64', uidb64)

      try {
        await apiInstance.post(`user/password-change/`, formdata).then((res) => {
          console.log(res.data);
          alert("Password Changed Successfully")
          navigate("/login")
          setIsLoading(false)
        })
      } catch (error) {
        alert("An error occured while trying to change the password")
        setIsLoading(false)
      }
    }
  }


  return (
    <section>
        <main className="" style={{ marginBottom: 100, marginTop: 50 }}>
            <div className="container">
                {/* Section: Login form */}
                <section className="">
                    <div className="row d-flex justify-content-center">
                        <div className="col-xl-5 col-md-8">
                            <div className="card rounded-5">
                                <div className="card-body p-4">
                                    <h3 className="text-center">Forgot Password</h3>
                                    <br />

                                    <div className="tab-content">
                                        <div
                                            className="tab-pane fade show active"
                                            id="pills-login"
                                            role="tabpanel"
                                            aria-labelledby="tab-login"
                                        >
                                            <form onSubmit={handlePasswordSubmit}>
                                                <div className="form-outline mb-4">
                                                    <label className="form-label" htmlFor="loginPassword">
                                                        Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        name="password"
                                                        className="form-control"
                                                        //onChange={handleEmailChange}
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                    />
                                                </div>

                                                <div className="form-outline mb-4">
                                                    <label className="form-label" htmlFor="loginName">
                                                        Confirm Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        name="password"
                                                        className="form-control"
                                                        //onChange={handleEmailChange}
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                    />
                                                </div>

                                                {isLoading === true
                                                    ?<button disabled type='button' className='btn btn-primary w-100'> Processing... </button>
                                                    :<button type='submit' className='btn btn-primary w-100'>Save Password <i className='fas fa-check-circle'/> </button>
                                                }

                                                <div className="text-center">
                                                    <p className='mt-4'> Already have an account? <Link to="/login">Login</Link></p>
                                                </div>                                        
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    </section>
  )
}

export default CreatePassword