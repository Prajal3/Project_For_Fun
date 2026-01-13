import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Login from "./components/auth/login"
import Signup from "./components/auth/signup"
const App =  () => {

  const route = createBrowserRouter([

    {
      path:"/",
      element:<Login/>,
    },
    {
      path:"/signup",
      element:<Signup/>,
    }



  ])
  return (
    <>
    <RouterProvider router={route} />
    
    </>
  )
}

export default App
