import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Home from '../layouts/home';

import '../assets/css/index.css';
import '../assets/css/login.css';

const login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  let logged = JSON.parse(localStorage.getItem('logged'));

  return (
    <Home>
      <div className="top-35vh">
        <div className="d-flex align-items-center justify-content-center mb-3vh">
          <h1 className="index-subtitle">{t('home.subtitle')}</h1>
        </div>

        <div className="d-flex align-items-center justify-content-center text-center">
          <h2 className="index-warning text-danger">{t('login.registration')}</h2>
        </div>

        <div className="d-flex align-items-center justify-content-center mt-5vh">
        {logged ? 
          <a href="/api/logout/">
          <button className="enter-button">
            <span>{t('login.return')}</span>
          </button>
          </a>
        :
          <a href="/">
          <button className="enter-button">
            <span>{t('login.return')}</span>
          </button>
          </a>
        }
        </div>
        <p className="text-center description-text mt-5vh">
          {t('home.description1')}
          <br />
          {t('home.description2')}
          <br />
          {t('home.description3')}
        </p>
      </div>
    </Home>
  );
};

export default login;
