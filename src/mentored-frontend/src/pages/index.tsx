import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Home from '../layouts/home';
import { useSelector } from 'react-redux';
import { RootState } from '../stores/reducers';
import { useTranslation } from 'react-i18next';
import { FcGoogle } from "react-icons/fc";
import CAFE from '../assets/img/logos/cafe-logo.png';
import GOOGLE from '../assets/img/logos/google-logo.png';
import '../assets/css/index.css'
import {mentored_api} from "../utils/useAxios";


import { useEffect } from "react";
import useAxios from "../utils/useAxios";
import Loading from './components/Loading';


const DEV = import.meta.env.DEV;

export default function HomePage() {
    const [name, setName] = useState('');
    const [isUserRegistered, setIsUserRegistered] = useState(false);
    const navigate = useNavigate();
    const username = useSelector((state: RootState) => state.user);
    const { t, i18n } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);

    // 
    const [res, setRes] = useState(null);
    const api = useAxios();

    let get_user_status = (res) => {
        if(res && res.data && res.data.user && res.data.user.status){
            return res.data.user.status;
        }
        if(res && res.user && res.user.status){
            return res.user.status;
        }
        return "Error";
    }


    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await api.get("/api/get_login_data/");
                console.log(response);
                setRes(response.data);
                localStorage.setItem('logged', true);
                localStorage.setItem('login_data', JSON.stringify(response.data));
                if(get_user_status(response.data) != "NoUser" && get_user_status(response.data) != "NoCOmanage" && get_user_status(response.data) != "Active"){
                    navigate("/login");
                }else if(get_user_status(response.data) == "Active"){
                    navigate("/dashboard");
                }else{
                    setIsLoading(false);
                }
            }
            catch {
                setRes(null);
                setIsLoading(false);
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isUserRegistered]);


    localStorage.setItem('logged', false);
    localStorage.setItem('user', null);
    let navigate_content = (
        <a href="/api/saml2/login/">
            <button className="enter-button">
                <img className='cafe-icon' src={CAFE} /><span>{t('home.cafeLabel')}</span>
            </button>
        </a>
    );

    if (DEV) {
        navigate_content = (
            <a href="/api/api-auth/login/?next=/">
                <button className="enter-button">
                    <span>DEV Login</span>
                </button>
            </a>
        );
    }

    return (
        isLoading 
        ? (
            <Loading insideTable={false} />
        ) : (
            <Home>
                <div className="top-35vh">
                    <div className="d-flex align-items-center justify-content-center mb-3vh">
                        <h1 className="index-subtitle">
                            {t('home.subtitle')}
                        </h1>
                    </div>
    
                    <div className="mb-2vh container mt-5vh">
                        <div className="row d-flex align-items-center justify-content-center mb-2vh">
                            {navigate_content}
                        </div>
    
                        <div className="row d-flex align-items-center justify-content-center">
                            <button className="enter-button" onClick={() => navigate("/login2")}>
                                <img className="google-icon" src={GOOGLE} alt="Google Icon" />
                                <span>{t('home.googleLabel')}</span>
                            </button>
                        </div>
                    </div>
    
                    <p className="text-center description-text mt-10vh">
                        {t('home.description1')}
                        <br />
                        {t('home.description2')}
                        <br />
                        {t('home.description3')}
                    </p>
                </div>
            </Home>
        )
    );
} 