import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Login from "./components/auth/login"
import Signup from "./components/auth/signup"
import VerifyOtp from "./components/auth/verifyOtp"
const App =  () => {

  const route = createBrowserRouter([

    {
      path:"/",
      element:<Login/>,
    },
    {
      path:"/signup",
      element:<Signup/>,
    },
    {
      path:"/verify-otp",
      element:<VerifyOtp/>,
      
    }



  ])
  return (
    <>
    <RouterProvider router={route} />
    
    </>
  )
}

export default App
