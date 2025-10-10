import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import Agenda from './Agenda.jsx'
import {Auth, AuthException} from './components/schedule/Autenticar.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <Routes>
      <Route path='/auth' element={<Auth />}/>        
      <Route path='/agenda' element={<Agenda />}/>        
      <Route path='/' element={<Agenda />}/>        
      <Route path='/authWrongEmail' element={<AuthException />}/>        
    </Routes>
    </BrowserRouter>
  </StrictMode>,
)
