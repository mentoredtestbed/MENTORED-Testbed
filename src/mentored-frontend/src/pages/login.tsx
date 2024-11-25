import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Home from '../layouts/home';

import '../assets/css/index.css';
import '../assets/css/login.css';

const login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  let logged = JSON.parse(localStorage.getItem('logged'));
  let login_data = JSON.parse(localStorage.getItem('login_data'));
  let status = login_data?.user?.status // PendingConfirmation PendingApproval

  return (
    <Home>
      <div className="top-35vh">
        <div className="d-flex align-items-center justify-content-center mb-3vh">
          <h1 className="index-subtitle">{t('home.subtitle')}</h1>
        </div>

        {status !== "Active"  &&
            <>
            {status === "PendingConfirmation" ? 
            <div className="d-flex align-items-center justify-content-center mb-3vh">
              <h1 className="index-subtitle text-danger">{t('login.pendingConfirmationText')}</h1>
            </div>
            : status === "PendingApproval" ?
            <div className="d-flex align-items-center justify-content-center mb-3vh">
              <h1 className="index-subtitle text-danger">{t('login.pendingApprovalText')}</h1>
            </div>
            :
            <>
              <div className="d-flex align-items-center justify-content-center mb-3vh">
                <h1 className="index-subtitle text-danger">{t('login.subtitle')}</h1>
              </div>
              <div className="d-flex align-items-center justify-content-center mt-5vh">
                <a href="/registry/co_petitions/start/coef:6">
                <button className="enter-button">
                  <span>{t('login.register')}</span>
                </button>
                </a>
              </div>
            </>
            }
            </>
        }

        

        
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
