import React, { useEffect, useState, useRef } from 'react'
import { IoSearchOutline } from "react-icons/io5";
import Loading from './Loading';
import UserSearchCard from './UserSearchCard';
import toast from 'react-hot-toast'
import axios from 'axios';
import { IoClose } from "react-icons/io5";

const SearchUser = ({onClose}) => {
    const [searchUser,setSearchUser] = useState([])
    const [loading,setLoading] = useState(false)
    const [search,setSearch] = useState("")

    const cancelToken = useRef(null); // To cancel previous axios requests

    const handleSearchUser = async () => {
        if(!search.trim()) {
          setSearchUser([]);
          setLoading(false);
          return;
        }

        const URL = `/api/search-user`

        try {
            setLoading(true)

            // Cancel previous request if exists
            if(cancelToken.current){
              cancelToken.current.cancel("Operation canceled due to new request.");
            }
            cancelToken.current = axios.CancelToken.source();

            const response = await axios.post(URL, {
                search: search
            }, {
              cancelToken: cancelToken.current.token
            })

            setSearchUser(response.data.data)
            setLoading(false)
        } catch (error) {
            if(axios.isCancel(error)){
              // Request canceled, do nothing
            } else {
              toast.error(error?.response?.data?.message || "Failed to fetch users")
              setLoading(false)
            }
        }
    }

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            handleSearchUser()
        }, 500); // 500ms debounce delay

        return () => clearTimeout(debounceTimeout);
    }, [search])

    return (
        <div className='fixed top-0 bottom-0 left-0 right-0 bg-slate-700 bg-opacity-40 p-2 z-10'>
            <div className='w-full max-w-lg mx-auto mt-10'>
                {/** input search user **/}
                <div className='bg-white rounded h-14 overflow-hidden flex '>
                    <input 
                        type='text'
                        placeholder='Search user by name, email....'
                        className='w-full outline-none py-1 h-full px-4'
                        onChange={(e)=>setSearch(e.target.value)}
                        value={search}
                    />
                    <div className='h-14 w-14 flex justify-center items-center'>
                        <IoSearchOutline size={25}/>
                    </div>
                </div>

                {/** display search user **/}
                <div className='bg-white mt-2 w-full p-4 rounded'>
                    {searchUser.length === 0 && !loading && (
                        <p className='text-center text-slate-500'>No user found!</p>
                    )}

                    {loading && (
                        <p><Loading/></p>
                    )}

                    {!loading && searchUser.length > 0 && (
                        searchUser.map((user) => (
                            <UserSearchCard key={user._id} user={user} onClose={onClose}/>
                        ))
                    )}
                </div>
            </div>

            <div className='absolute top-0 right-0 text-2xl p-2 lg:text-4xl hover:text-white' onClick={onClose}>
                <button>
                    <IoClose/>
                </button>
            </div>
        </div>
    )
}

export default SearchUser
