import React from "react";
import hi from './files4.svg'
import welcome from './welcome1.svg'
import axios from 'axios'
function Signin()
{
    return(
        <div className="Signin">
            <div className="storage-info">
                <h2 className="brand"><span class="material-icons-outlined crop">crop</span>Memories</h2>
                <img className="illustration" src={hi} alt="" srcset="" />
                <p className="info">The home for your memories...</p>
            </div>
            <div className="google-signin">
                <img className="greetings" src={welcome} alt="" srcset="" />
                <div className="google-cont">
                    <a className="google-anchor" href="http://localhost:5000/auth/google">
                        <h2 className="g-btn"><img className="fa-google" src="https://img.icons8.com/color/144/000000/google-logo.png"/>Signin</h2>
                    </a>
                    
                </div>
                <p className="benefits">* Sigin and get 100MB free storage</p>
            </div>
        </div>
    )
}
export default Signin;