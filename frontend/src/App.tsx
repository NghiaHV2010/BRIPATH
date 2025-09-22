import { Route, Routes } from 'react-router'
import './App.css'
import LoginGoole from './components/LoginGoole'

function App() {

  return (
    <Routes>
      <Route index element={<>Hello</>} />
      <Route path='/login' element={<LoginGoole />} />
      <Route path='/register' element={<>register</>} />
      <Route path='/test' element={<>test</>} />
    </Routes>
  )
}

export default App
