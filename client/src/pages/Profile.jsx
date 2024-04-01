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
    </div>
  )
}
