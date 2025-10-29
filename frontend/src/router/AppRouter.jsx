import { Navigate, Route, Routes } from "react-router-dom"
import { AuthRoutes } from "../auth/routes/AuthRoutes"
import { ChatRoutes } from "../chat/routes/ChatRoutes"

export const AppRouter = () => {  

const status = 'No Authenticated' // TODO: remove this line after implementing auth check
  return (
    <Routes>
      {
        (status === 'Authenticated')
        ? <Route path="/*" element={<ChatRoutes />} />
        : <Route path="/auth/*" element={<AuthRoutes />} />
      }

      <Route path="/*" element={<Navigate to='/auth/login' />} />
    </Routes>
  )
}
