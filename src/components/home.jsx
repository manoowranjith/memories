import React from "react";
import axios from "axios";
import swal from 'sweetalert';

function Home()
{
    const [storage, setStorage]=React.useState(0)
    const [name, setName]=React.useState()
    const [allImages, setAllImages]=React.useState([]) 
    const [currentNav, setCurrentNav]=React.useState("gallery")
    const [progressStatus, setProgressStatus]=React.useState(0)
    React.useEffect(()=>{

        var options = {
            method: 'GET',
            url: 'http://localhost:5000/commonDetails',
        }

        axios.request(options).then(function (response) 
        {
            setStorage(response.data[0].storage)
            setName(response.data[0].name)
            console.log(response.data[0])
        })
        .catch(function (error) {
            console.error(error);
        })

        var getall = {
            method: 'GET',
            url: 'http://localhost:5000/gallery',
        }

        axios.request(getall).then(function (response) 
        {
            setAllImages(response.data)
        })
        .catch(function (error) {
            console.error(error);
        })
        document.getElementById("home-icon").classList.add("highlighter");
    },[])

    function fileupload()
    {
            if(document.querySelector('#file').files.length === 0) {
                swal({
                    title: "No Files!",
                    icon: "warning",
                    buttons: false,      
                  });
                return;
            }
            console.log(document.querySelector('#file').files)
            
            let file = document.querySelector('#file').files[0];
        
            let allowed_mime_types = [ 'image/jpeg', 'image/png' ];
            
            let allowed_size_mb = 2;
            
            if(allowed_mime_types.indexOf(file.type) === -1) {
                swal({
                    title: "Unsupported format",
                    icon: "error",
                    buttons: false,
                    text: "only JPG, JPEG, PNG",      
                  });
                return;
            }
        
            if(file.size > allowed_size_mb*1024*1024) {
                  swal({
                    title: "Too large!",
                    icon: "error",
                    buttons: false,
                    text: "Exceeds size of 2MB",      
                  });
                return;
            }
        
            if(Math.ceil((storage+(file.size)/1024)/1024)>=100)
            {
                swal({
                    title: "Limit reached!",
                    icon: "error",
                    buttons: false,
                    text: "Upto 100MB only",      
                  });
            }
            else
            {
                const config = {
                    onUploadProgress: progressEvent => setProgressStatus(parseInt((progressEvent.loaded/progressEvent.total)*100))
                }
                let data = new FormData();
                data.append('file', file);
                axios.post('http://localhost:5000/', data, config, {
                    headers: {
                    'Content-Type': 'multipart/form-data'
                    }
                })
                .then(response=>{
                    if(response.data.message==="duplicate")
                    {
                        swal({
                            title: "Duplicate Found!",
                            icon: "warning",
                            buttons: false,     
                          });
                    }
                    if(response.data.message==="unsupported")
                    {
                        swal({
                            title: "Unsupported format",
                            icon: "error",
                            buttons: false,
                            text: "only JPG, JPEG, PNG",      
                          });
                    }
                    if(response.data.message==="success")
                    {
                        console.log("100% completed")
                        updateStorage()
                        document.getElementById('done').style.opacity='1';
                        setTimeout(()=>{
                            document.getElementById('done').style.opacity='0';
                            var getall = {
                                method: 'GET',
                                url: 'http://localhost:5000/gallery',
                            }
                    
                            axios.request(getall).then(function (response) 
                            {
                                setAllImages(response.data)
                                console.log(response)
                            })
                            .catch(function (error) {
                                console.error(error);
                            })
                        },2000)
                    }
                })
            }
    }
    React.useEffect(()=>{
        if(progressStatus===0 || progressStatus===100)
        {
            document.getElementById('progress').style.display='none';
            if(progressStatus===100)
            {
                setProgressStatus(0)
            }
        }
        else{
            document.getElementById('progress').style.display='block';
            document.getElementById('progress').style.width=`${(progressStatus/100)*160}px`;
        }
    },[progressStatus])

    function nav(id,route)
    {
        setCurrentNav(route)
        document.getElementById("home-icon").classList.remove("highlighter");
        document.getElementById("fav-icon").classList.remove("highlighter");
        document.getElementById("trash-icon").classList.remove("highlighter");
        
        var element = document.getElementById(id);
        element.classList.add("highlighter");

        var options = {
            method: 'GET',
            url: 'http://localhost:5000/'+route,
        }

        axios.request(options).then(function (response) 
        {
            setAllImages(response.data)
        })
        .catch(function (error) {
            console.error(error);
        })
    }   

    function addTo(category, element)
    {

        console.log(category, element)
        var options = {
            method: 'GET',
            url: 'http://localhost:5000/'+category+'/'+element.Id,
        }

        axios.request(options).then(function (response) 
        {
            console.log(response)
            var option = {
                method: 'GET',
                url: 'http://localhost:5000/gallery',
            }
    
            axios.request(option).then(function (response) 
            {
                setAllImages(response.data)
            })
        })
    }
    
    function removeFrom(category, element)
    {

        console.log(category, element)
        var options = {
            method: 'GET',
            url: 'http://localhost:5000/'+category+'/'+element.Id,
        }

        axios.request(options).then(function (response) 
        {
           if(category==='removefav')
           {
            var option = {
                method: 'GET',
                url: 'http://localhost:5000/fav',
            }
    
            axios.request(option).then(function (response) 
            {
                setAllImages(response.data)
            })
           }
           else if(category==="removetrash")
           {
                var option1 = {
                    method: 'GET',
                    url: 'http://localhost:5000/trash',
                }
        
                axios.request(option1).then(function (response) 
                {
                    setAllImages(response.data)
                })
           }
        })
    }
    function updateStorage()
    {
        var options = {
            method: 'GET',
            url: 'http://localhost:5000/commonDetails',
        }

        axios.request(options).then(function (response) 
        {
            setStorage(response.data[0].storage)
        })
        .catch(function (error) {
            console.error(error);
        })
    }

    return(
        <div className="home">
            <div className="header">
                <h2 className="brand"><span className="material-icons-outlined crop">crop</span>Memories</h2>
                <div className="user-details">
                <div className="user-info">
                    <span className="user-name">Hi, {name}</span> 
                    <img className="user-img" src={"http://localhost:5000/dp"} alt="" srcSet="" />
                    <div className="seperator"></div>
                </div>
                <p className="logout"><a href="http://localhost:5000/logout"><span class="material-icons-outlined logout-icon">logout</span></a></p>
                </div>
               </div>
            <div className="media-content">
                    <div className="options">
                        <p onClick={()=>nav("home-icon","gallery")}><span id="home-icon" className="material-icons-outlined options-icon home-icon">collections</span>Gallery</p>
                        <p onClick={()=>nav("fav-icon","fav")}><span id="fav-icon" className="material-icons-outlined options-icon fav-icon">favorite_border</span>Favourites</p>
                        <p onClick={()=>nav("trash-icon","trash")}><span id="trash-icon" className="material-icons-outlined options-icon del-icon">delete</span>Trash</p>
                        <div>
                            <div className="upload">
                                <div className="file-input">
                                    <input type="file" id="file" className="file custom-file-input" accept="image/jpeg, image/png, image/jpg"/>
                                    <label htmlFor="file"><span className="material-icons-outlined attach">add_a_photo</span></label>
                                </div>
                                <button onClick={()=>fileupload()} className="upload-btn"><span className="material-icons-outlined file-upload-icon">cloud_upload</span></button>
                            </div>
                            <br />
                            <p id='progress' className="progress"><span className="percent">{progressStatus+'%'}</span></p>
                            <p id="done"><span class="material-icons-outlined done">done</span></p>
                        </div>
                        <div className="storage-cont">
                            <p className="storage">{Math.ceil(((storage/1024)/100)*100)}% used<span className="max">{Math.floor(100-(storage/1024))}MB free</span></p>
                        </div>
                    </div>
                    <div className="images">
                        <div className="image-type">
                            <a href="https://buymeacoffee.com/ajmanoowo">
                                <p className="coffee">Buy me a coffee!</p>
                                <span class="material-icons-outlined coffee-icon">coffee</span>
                            </a>
                            
                        </div>
                        <div className="photos">
                        {currentNav==="trash"?(<div className="del-message"><p className="del-message-p">WORKING ON PERMANENT DELETION</p></div>):("")}
                        {
                                    allImages.length===0?(<div className="nothing">\(o_o)/</div>):("")
                        }
                            <div className="my-photos">
                                {allImages.map((element)=>{
                                    return(
                                        <div className="column">
                                        <div className="user-options">
                                            <a className="a-image" href={"http://localhost:5000/original/"+element.Id}><img loading="lazy" className="img-rendered" src={"http://localhost:5000/compress/"+element.Id} alt="" srcSet="" /></a>
                                            {/* <div className="actions actions-hover"> */}
                                                {
                                                    currentNav==="gallery"?
                                                    (
                                                        
                                                            <div  className="actions actions-hover">
                                                            <span onClick={()=>{addTo("setfav",element)}} className="material-icons action-icons">favorite</span>
                                                            <span onClick={()=>{addTo("settrash",element)}} className="material-icons action-icons">delete</span>
                                                            </div>
                                                        
                                                    ):(
                                                        currentNav==="fav"?
                                                       (<div  className="actions actions-hover">
                                                            <span  onClick={()=>{removeFrom("removefav",element)}} class="material-icons-outlined action-icons">remove_circle</span>
                                                        </div>)
                                                        :(
                                                            <div  className="actions actions-hover">
                                                                <span  onClick={()=>{removeFrom("removetrash",element)}} class="material-icons-outlined action-icons">add_circle</span>
                                                            </div>
                                                        )
                                                    )
                                                }
                                        </div>
                                        </div>
                                    )
                                })
                                }
                            </div>
                        </div>
                    </div>
            </div>
        </div>
    )
}
export default Home;
