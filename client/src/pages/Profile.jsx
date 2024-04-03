import {useSelector} from 'react-redux'
import {Link} from "react-router-dom";
import { useRef,useState,useEffect } from 'react';
import {getDownloadURL, getStorage,ref, uploadBytes, uploadBytesResumable} from 'firebase/storage';
import {app} from '../firebase'
import { updateUserFailure, updateUserStart, updateUserSuccess, deleteUserFailure,deleteUserStart,deleteUserSuccess, signOutStart, signOutFailure,signOutSuccess } from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';
export default function Profile() {
  const fileRef = useRef(null);
  const {currentUser,loading,error} = useSelector(state=>state.user);
  const [file, setFile] = useState(null);
  const [filePerc,setFilePerc] = useState(0);
  const [fileUploadError,setFileUploadError] = useState(false);
  const [formData,setFormData] = useState({});
  const [updateSuccess,setUpdateSuccess] = useState(false);
  const [showListingsError,setShowListingsError] = useState(false);
  const [userListings,setUserListings] = useState([]);
  const [deleteListing,setDeleteListing] = useState(false);
  const [showListing,setShowListing] = useState(false);
  const dispatch = useDispatch();
  useEffect(()=>{
    if(file)
    {
      handleFileUpload(file);
    }
  },[file]);

  const handleFileUpload = (file)=>{
    const storage = getStorage(app);
    const fileName = new Date().getTime()+file.name;
    const storageRef = ref(storage,fileName);
    const uploadTask = uploadBytesResumable(storageRef,file);
    uploadTask.on('state_changed',
    (snapshot)=>{
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) *100;
      setFilePerc(Math.round(progress));
    },
    (error)=>{
      setFileUploadError(true);
    },
    ()=>{
      getDownloadURL(uploadTask.snapshot.ref).then
      ((downladURL) => {
        setFormData({
          ...formData,
          avatar:downladURL
        });


      })

    });
  }

  const handleChange = (e) =>{
    setFormData({...formData,[e.target.id]:e.target.value});

  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      dispatch(updateUserStart());
      const res = await fetch (`/api/user/update/${currentUser._id}`,{
        method:"POST",
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify(formData),
      });
      const data = await res.json();
      if(data.success === false){
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    }catch(error)
    {
      console.log(error.message);
      disptch(updateUserFailure(error.message));
    }
  }

  const handleDelete = async ()=>{
    try{
      dispatch(deleteUserStart());
      const res = await fetch (`/api/user/delete/${currentUser._id}`,{
        method:"DELETE",
      });
      const data = await res.json();
      if(data.success === false){
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    }catch(error)
    {
      dispatch(deleteUserFailure(error.message));
    }
  }

  const handleSignOut = async ()=>{
    try{
      dispatch(signOutStart());
      const res = await fetch ('/api/auth/signOut');
      const data = await res.json();
      if(data.success === false){
        dispatch(signOutFailure(data.message));
        return;
      }
      dispatch(signOutSuccess(data));
    }catch(error)
    {
      dispatch(signOutFailure(error.message));
    }
  }

  const handleShowListings = async () =>{
    setShowListing(true)
    try{
      setShowListingsError(false);
      const res = await fetch(`/api/user/listing/${currentUser._id}`);
      const data = await res.json();
      if(data.success == false)
      {
        setShowListingsError(true);
        return;
      }
      setUserListings(data);
      console.log(userListings)
    }catch(error)
    {
      setShowListingsError(true);
    }
  }

  const handleDeleteListing = async (listingId) => {
    try{
      setDeleteListing(false);
      const res = await fetch(`/api/listing/delete/${listingId}`,{
        method:'DELETE'
      });
      const data = await res.json();
      if(data.success == false)
      {
        setDeleteListing(false);
        console.log(data.message);
        return;
      }
      setUserListings((prev) => prev.filter((listing)=>listing._id !== listingId));
      setDeleteListing(true);
    }catch(error)
    {
      console.log(error.message);
      setDeleteListing(false);
    }
  }
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input type="file" onChange={(e)=>setFile(e.target.files[0])} ref={fileRef} hidden accept="image/*"/>
        <img src={formData.avatar? formData.avatar:currentUser.avatar} onClick={()=>fileRef.current.click()} className="rounded-full w-24 h-24 object-cover cursor-pointer self-center mt-2" alt="profile" />
        <p className='text-sm self-center'>
          {fileUploadError ?
           (<span className='text-red-700'>Error image upload!</span>) :
           filePerc>0 && filePerc < 100 ? (
            <span className="text-slate-700">

              {`Uploading ${filePerc}%`}
            </span>)
            :
            filePerc===100 && !fileUploadError ? (<span className='text-green-700'>Image Uploaded Successfully</span>):""
           
          }
        </p>
        <input type="text" placeholder='username'
          defaultValue={currentUser.username}
          onChange={handleChange}
          id="username"
          className='border p-3 rounded-lg'
        />
        <input type="email" placeholder='email'
          defaultValue={currentUser.email}
          onChange={handleChange}
          id="email"
          className='border p-3 rounded-lg'
        />
        <input type="password" placeholder='password' 
          onChange={handleChange}
          id="password"
          className='border p-3 rounded-lg'
        />
        <button disabled={loading} className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'>{loading ? 'loading...':'update'}</button>
        <Link className='bg-green-700 text-white 
                            rounded-lg p-3 uppercase 
                            hover:opacity-95 disabled:opacity-80 
                            text-center' 
              to={"/create-listing"}>
          create Listing
        </Link>
      </form>

      <div className='flex justify-between mt-5'>
        <span className='text-red-700 cursor-pointer' onClick={handleDelete}>Delete Account</span>
        <span className='text-red-700 cursor-pointer' onClick={handleSignOut}>Sign out</span>
      </div>
      <p className='text-red-700 mt-5'>{error ? error : ''}</p>
      <p className='text-green-700 mt-5'>
        {updateSuccess ? 'User is updated successfully!' : ''}
      </p>

      <button onClick={handleShowListings} className='text-green-700 w-full '>Show Listings</button>
      <p className='text-red-700 mt-5'>{showListingsError ? showListingsError : ''}</p>
      
      
      {userListings.length>0 &&
        <div className=' flex flex-col gap-4'>
          <h1 className='text-center mt-7 text-2xl font-semibold'>Your Listings</h1>
          <p className='text-green-700 mt-5 text-center'>{deleteListing ? 'Listing Has been deleted Successfully!' : ''}</p>
          {userListings.map((listing)=>
            <div key={listing._id} className='flex border gap-4 rounded-lg p-3 justify-between items-center'>
              <Link to={`/listing/${listing._id}`}>
                <img className='h-16 w-16 object-contain' src={listing.imageUrls[0]} alt="listing image" />
              </Link>
              <Link to={`/listing/${listing._id}`} className='flex-1 text-slate-700 font-semibold  hover:underline truncate'>
                <p >{listing.name}</p>
              </Link>

              <div className='flex flex-col items-center'>
                <button onClick={()=>handleDeleteListing(listing._id)} className='text-red-700 uppercase'>Delete</button>
                <Link to={`/update-listing/${listing._id}`}>
                  <button className='text-green-700 uppercase'>Edit</button>
                </Link>
              </div>
            </div>
          )}
        </div>
      }
      {showListing && userListings.length == 0 && (
        <div className='flex flex-col'>
          <h1 className='text-center mt-7 text-xl font-semibold'>You dont have listing to show right now!</h1>
        </div>
      )}
    </div>
  )
}
