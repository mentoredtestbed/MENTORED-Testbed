import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import 'chart.js/auto';
import '../../assets/css/dashboard-layout.css';

export default function SideBar() {
  const { t } = useTranslation();
  return (
    <nav className="sidebar menu-sidebar left-1vw h-75vh w-13vw mt-5vh rounded-2vw">
      <ul className="nav flex-column top-8vh left-1vh">

        <li className="nav-item">
          <Link to="/dashboard" className="nav-link button home w-12vw">
            {t('sidebar.home')}
          </Link>
        </li>

        <li className="nav-item">
          <div className="dropdown dropright">
            <button
              className="nav-link button projects top-1vh w-12vw"
              type="button"
              id="dropdownMenuButton"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              {t('sidebar.projects')}
            </button>
            <div className="dropdown-menu projects-drop" aria-labelledby="dropdownMenuButton">
              <div className="container-fluid ">
                <div className="row">
                  <div className="col-md-4">
                    <h3 className="mt-5 text-white project-name text-center">{t('sidebar.project')} 1</h3>
                  </div>
                  <div className="col-md-8">
                    <div className="row">
                      <div className="col-md-12 mb-1">
                        <Link to="/experiments" className="nav-link button  experiments">
                          {t('sidebar.experiments')}
                        </Link>
                      </div>
                      <div className="col-md-12">
                        <Link to="/execution" className="nav-link button  execution">
                          {t('sidebar.experimentsexecutions')}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                <hr className="bg-white" />
              </div>
            </div>
          </div>
        </li>

        <li className="nav-item">
          <Link to="/requests" className="nav-link button top-2vh w-12vw">
            {t('sidebar.requests')}
          </Link>
        </li>

        <li className="nav-item">
          <Link to="/settings" className="nav-link button top-3vh w-12vw">
            {t('sidebar.settings')}
          </Link>
        </li>

      </ul>
    </nav>
  );
}
