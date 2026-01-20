import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Login from "./components/auth/login"
import Signup from "./components/auth/signup"
import VerifyOtp from "./components/auth/verifyOtp"
import Home  from "./pages/home"
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
      
    },
    {
      path:"/home",
      element:<Home/>,
    }



  ])
  return (
    <>
    <RouterProvider router={route} />
    
    </>
  )
}

export default App
