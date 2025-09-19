import { Route, Routes } from 'react-router'
import './App.css'

function App() {

  return (
    <Routes>
      <Route index element={<>Hello</>} />
      <Route path='/login' element={<>login</>} />
      <Route path='/register' element={<>register</>} />
      <Route path='/test' element={<>test</>} />
    </Routes>
  )
}

export default App
