import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ToastContainer, toast } from 'react-toastify'
import axios from 'axios'
import GoogleButton from "../components/GoogleButton"
import API from '../api/axios'

const Login = () => {

  const navigate = useNavigate()
  const [inputValue, setInputValue] = useState({
    email: "",
    password: ""
  })

  const { email, password } = inputValue

  const handleInput = (e) => {
    const { name, value } = e.target
    setInputValue(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleError = (err) => {
    toast.error(err, {
      position: "bottom-right"
    })
  }

  const handleSuccess = (msg) => {
    toast.success(msg, {
      position: "bottom-right"
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await API.post('/auth/login', inputValue)

      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('userName', response.data.name)

        const userData = {
          _id: response.data._id,
          name: response.data.name,
          email: response.data.email
        }
        localStorage.setItem('user', JSON.stringify(userData))

        handleSuccess("Logged In!")

        setTimeout(() => {
          window.location.href = '/home'
        }, 1000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to connect to server"
      handleError(errorMsg)
      console.error("Auth Error:", err)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F9FBFA] p-4">

      <div className="flex flex-row-reverse w-full max-w-6xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">

        <div className="w-full p-10 md:w-1/2 lg:p-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#001E2B]">Login</h2>
            <p className="text-gray-500">
              Enter your credentials to access your account
            </p>
          </div>

          <form className="flex flex-col gap-5"
            onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#001E2B]">
                Email
              </label>
              <input
                type="email"
                placeholder="name@company.com"
                className="rounded border border-gray-300 p-3 outline-none transition focus:border-[#00ED64] focus:ring-1 focus:ring-[#00ED64]"
                required
                name="email"
                value={inputValue.email}
                onChange={handleInput}
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-[#001E2B]">
                  Password
                </label>
                <span className="text-xs text-[#00684A] font-semibold hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="rounded border border-gray-300 p-3 outline-none transition focus:border-[#00ED64] focus:ring-1 focus:ring-[#00ED64]"
                required
                name="password"
                value={inputValue.password}
                onChange={handleInput}
              />
            </div>

            <button
              type="submit"
              className="mt-4 rounded bg-[#00ED64] py-3 font-bold text-[#001E2B] transition hover:bg-[#00c853]"
            >
              Log In
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register">
              <span className="cursor-pointer text-[#00684A] font-semibold hover:underline">
                Register
              </span>
            </Link>
          </p>

          <div className="flex items-center my-6">
            <div className="flex grow h-px bg-gray-300"></div>
            <span className="mx-4 text-gray-500 text-sm">OR</span>
            <div className="flex grow h-px bg-gray-300"></div>
          </div>

          <GoogleButton />
        </div>

        <div className="hidden w-1/2 flex-col items-center justify-center bg-[#001E2B] p-12 text-white md:flex">
          <div className="max-w-sm text-center">
            <div className="mb-6 inline-block rounded-full bg-[#00ED64] p-4">
              <div
                className="h-8 w-8 bg-[#001E2B]"
                style={{
                  clipPath:
                    "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                }}
              ></div>
            </div>
            <h3 className="mb-4 text-4xl font-bold">Welcome Back</h3>
            <p className="text-lg text-gray-300">
              Log in to manage your databases and continue building your applications
            </p>
          </div>
        </div>

      </div>

      <ToastContainer />
    </div>
  )
}

export default Login