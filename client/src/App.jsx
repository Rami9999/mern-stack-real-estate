import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import About from './pages/About';
import Profile from './pages/Profile';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import PrivateRouteSign from './components/PrivateRouteSign';
import CreateListing from './pages/createListing';
import UpdateListing from './pages/updateListing';
export default function App() {

  return <BrowserRouter>
    <Header />

    <Routes>
      <Route path="/" element={<Home />}/>

      <Route element={<PrivateRouteSign/>}>
        <Route path="/sign-in" element={<SignIn />}/>
      </Route>

      <Route element={<PrivateRouteSign/>}>
        <Route path="/sign-up" element={<SignUp />}/>
      </Route>

      <Route path="/about" element={<About />}/>

      <Route element={<PrivateRoute/>}>
        <Route path="/profile" element={<Profile />}/>
        <Route path="/create-listing" element={<CreateListing />}></Route>
        <Route path="/update-listing/:listingId" element={<UpdateListing />}></Route>

      </Route>

    </Routes>
  </BrowserRouter>;
}
