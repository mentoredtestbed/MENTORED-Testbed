import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Home from '../layouts/home';
import { useSelector } from 'react-redux';
import { RootState } from '../stores/reducers';
import { useTranslation } from 'react-i18next';
import '../assets/css/index.css'
import { MDBDropdown, MDBDropdownMenu, MDBDropdownToggle, MDBDropdownItem } from 'mdb-react-ui-kit';
import Header from './components/Header'
import '../assets/css/login.css'


export default function Login() {
    const [name, setName] = useState('');
    const navigate = useNavigate()
    const username = useSelector((state: RootState) => state.user); 20
    const { t } = useTranslation()

    return (
        <Home>
            <Header />
            <div className="top-35vh">
                <div className="d-flex align-items-center justify-content-center bottom-6vh mb-6vh" >
                    <h1 className="login-subtitle text-center capitalize" >
                        {t('login.projectvinculation1')}
                        <br />
                        {t('login.projectvinculation2')}
                    </h1>
                </div>
                <div className='d-flex align-items-center justify-content-center mb-18vh'>
                    <button className="enter-button" onClick={() => navigate("/dashboard")}>
                        <span>{t('login.project')}</span>
                    </button>
                </div>
                <div className='d-flex align-items-center justify-content-center '>
                    <select className='project-selection'>
                        <option value="project1">Project 1</option>
                        <option value="project2">Project 2</option>
                        <option value="project3">Project 3</option>
                        <option value="project4">Project 4</option>
                        <option value="project5">Project 5</option>
                    </select>
                </div>
            </div>
        </Home>
    );
}

