import React, { useEffect, useState } from 'react'
import {getDownloadURL, getStorage,ref, uploadBytes, uploadBytesResumable} from 'firebase/storage';
import {app} from '../firebase';
import { useSelector } from 'react-redux';
import { useNavigate ,useParams} from 'react-router-dom';


export default function UpdateListing() {
    const [files,setFiles] = useState([]);
    const [formData,setFormData] = useState({
        imageUrls:[],
        name:'',
        description:'',
        address:'',
        type:'rent',
        bedrooms:1,
        bathrooms:1,
        regularPrice:50,
        discountPrice:0,
        offer:false,
        parking:false,
        furnished:false,

    });
    const [uploading,setUploading] =useState(false);
    const [imageUploadError,setImageUploadError] = useState(false);
    const [error,setError] = useState(false);
    const [loading,setLoading] = useState(false);
    const {currentUser} = useSelector(state=>state.user);
    const navigate = useNavigate();
    const params = useParams();
    useEffect(() => {
        const fetchListing = async () => {
            const listingId = params.listingId;
            const res = await fetch(`/api/listing/getListing/${listingId}`);
            const data = await res.json();
            if(data.success === false)
            {
                console.log(data.message);
            }
            setFormData(data);
        }
        fetchListing();
    },[])
    const handleImageSubmit = (e)=>{
        e.preventDefault();
        
        if(files.length>0 && files.length + formData.imageUrls.length <7)
        {
            setUploading(true);
            setImageUploadError(false);

            const promises = [];
            for(let i=0;i<files.length;i++)
            {
                promises.push(storeImage(files[i]));

            }
            Promise.all(promises).then((urls)=>{
                setFormData({
                    ...formData,
                    imageUrls:formData.imageUrls.concat(urls)
                });
                setImageUploadError(false);
                setUploading(false);

            }).catch((err)=>{
                setImageUploadError('Image Upload Failed (2 mb max per image)');
                setUploading(false);
            });
        }else{
            setImageUploadError('You can only upload up to 6 images');
            setUploading(false);
        }
    }
    
    const storeImage = async (file) => {
        return new Promise((resolve,reject)=>{
            const storage = getStorage(app);
            const fileName = new Date().getTime()+file.name;
            const storageRef = ref(storage,fileName);
            const uploadTask = uploadBytesResumable(storageRef,file);
            uploadTask.on("state_changed",
            (snapshot)=>{
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) *100;
            },
            (error)=>{
                reject(error);
            },
            ()=>{
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL)=>{
                    resolve(downloadURL);
                });
            });
        });
    }

    const handleRemoveImage = (index) => {
        setFormData({
            ...formData,
            imageUrls : formData.imageUrls.filter((_,i)=>i !== index),
        });

    }

    const handleChange = (e) =>{
        if(e.target.id === 'sale' || e.target.id==='rent'){
            setFormData({
                ...formData,
                type:e.target.id
            });
        }
        else if(e.target.id === 'parking' || e.target.id ==='offer' || e.target.id==="furnished")
        {
            setFormData({
                ...formData,
                [e.target.id]:e.target.checked
            });
        }
        else
        {
                setFormData({
                ...formData,
                [e.target.id]:e.target.value
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            if(formData.imageUrls.length<1)
            {
                setError('You must upload at least 1 image');
                return;
            }

            if(+formData.regularPrice < +formData.discountPrice)
            {
                setError('Discounted price must be less than the regular price');
                return;
            }

            setError(false);
            setLoading(true);

            const res = await fetch(`/api/listing/update/${params.listingId}`,{
                method:"POST",
                headers: {
                    'Content-Type':"application/json"
                },
                body: JSON.stringify({
                    ...formData,
                    userRef:currentUser._id
                })
            });
            const data = await res.json();
            setLoading(false);
            if(data.success === false)
            {
                setError(data.message);
                return;
            }
            navigate(`/listing/${data._id}`);
        }catch(error)
        {
            setError(error.message);
            setLoading(false);
        }
    }
  return (
    <main className='p-3 max-w-4xl mx-auto'>
        <h1 className='text-3xl font-semibold text-center my-7'>Update a Listing</h1>

        <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-4'>
            <div className='flex flex-col gap-4 flex-1'>

                <input onChange={handleChange} value={formData.name} type="text" placeholder='name' 
                className='border p-3 rounded-lg' 
                id="name"
                maxLength='62' 
                minLength='10'
                required />

                <textarea onChange={handleChange} value={formData.description} type="text" placeholder='description' 
                className='border p-3 rounded-lg' 
                id="description"
                required />

                <input onChange={handleChange} value={formData.address} type="text" placeholder='address' 
                className='border p-3 rounded-lg' 
                id="address"
                required />
                <div className='flex gap-6 flex-wrap'>
                    <div className='flex gap-2'>

                        <input onChange={handleChange} checked = {formData.type==='sale'} type="checkbox" id="sale" className='w-5'/>
                        <span>Sell</span>

                    </div>
                    <div className='flex gap-2'>

                        <input onChange={handleChange} checked = {formData.type==='rent'}  type="checkbox" id="rent" className='w-5'/>
                        <span>Rent</span>

                    </div>
                    <div className='flex gap-2'>

                        <input onChange={handleChange} checked = {formData.parking}  type="checkbox" id="parking" className='w-5'/>
                        <span>Parking Spot</span>

                    </div>
                    <div className='flex gap-2'>

                        <input onChange={handleChange} checked = {formData.furnished}  type="checkbox" id="furnished" className='w-5'/>
                        <span>Furnished</span>

                    </div>
                    <div className='flex gap-2'>

                        <input onChange={handleChange} checked = {formData.offer} type="checkbox" id="offer" className='w-5'/>
                        <span>Offer</span>

                    </div>
                </div>

                <div className='flex flex-wrap gap-6'>
                    <div className='flex gap-2 items-center'>
                        <input onChange={handleChange} value={formData.bathrooms} type="number" id="bathrooms" min='1' max="10" required className='p-3 border border-gray-300 rounded-lg'/>
                        <p>Baths</p>
                    </div>
                    <div className='flex gap-2 items-center'>
                        <input onChange={handleChange} value={formData.bedrooms} type="number" id="bedrooms" min='1' max="10" required className='p-3 border border-gray-300 rounded-lg'/>
                        <p>Beds</p>
                    </div>
                    <div className='flex gap-2 items-center'>
                        <input onChange={handleChange} value={formData.regularPrice} type="number" id="regularPrice" min='50' max="100000000" required className='p-3 border border-gray-300 rounded-lg'/>
                        <div className='flex flex-col items-center'>
                            <p>Regular Price</p>
                            {formData.type==='rent' && <span className='text-xs'>($ / month)</span>}

                        </div>
                    </div>
                    {formData.offer && <div className='flex gap-2 items-center'>
                        <input onChange={handleChange} value={formData.discountPrice} type="number" id="discountPrice" min='0' max="100000000" required className='p-3 border border-gray-300 rounded-lg'/>
                        <div className='flex flex-col items-center'>
                            <p>Discounted Price</p>
                            {formData.type==='rent' && <span className='text-xs'>($ / month)</span>}
                        </div>
                    </div>}
                </div>
            </div>

            <div className='flex flex-col gap-4 flex-1'>
                <p className='font-semibold'>Images:
                    <span className='font-normal text-gray-600 ml-2'>The first image will be the cover (max 6)</span>
                </p>
                <div className='flex gap-4'>
                    <input className="p-3 border border-gray-300 rounded w-full" onChange={(e)=>setFiles(e.target.files)} type="file" id="images" accept='image/*' multiple />
                    <button  disabled={loading ||uploading} type="button" onClick={handleImageSubmit} className='p-3 text-green-700 border
                     border-green-700 rounded uppercase
                     hover:shadow-lg disabled:opacity-80'>{uploading ? 'Uploading...':'upload'}</button>
                </div>
                <p className='text-red-700 text-sm'>{imageUploadError && imageUploadError}</p>
                {formData.imageUrls.length > 0 &&
                    formData.imageUrls.map((url, index) => (
                    <div
                        key={url}
                        className='flex justify-between p-3 border items-center'
                    >
                        <img
                        src={url}
                        alt='listing image'
                        className='w-20 h-20 object-contain rounded-lg'
                        />
                        <button
                        type='button'
                        onClick={() => handleRemoveImage(index)}
                        className='p-3 text-red-700 rounded-lg uppercase hover:opacity-75'
                        >
                        Delete
                        </button>
                    </div>
                    ))}
                <button disabled={loading || uploading} className='uppercase p-3 bg-slate-700 text-white rounded-lg hover:opacity-95 disabled:opacity-80'>{loading ? 'Updating...':'Update Listing'}</button>
                {error && <p className='text-red-700 text-sm'>{error}</p>}
            </div>
        </form>
    </main>
  )
}
