import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import 'chart.js/auto';
import '../../assets/css/dashboard-layout.css';
import useAxios from '../../utils/useAxios';

const { DEV } = import.meta.env;
const baseURL = import.meta.env.VITE_API_BASE_URL;

const sideBar = () => {
  const { t } = useTranslation();
  const [res, setRes] = useState(null);
  const api = useAxios();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/get_login_data/');
        setRes(response.data);
        let isAdmin = response?.data?.user?.is_admin;
        setIsAdmin(isAdmin || false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();

    if (DEV) {
      setIsAdmin(true);
    }
  }, []);

  const sidebarLinks = [
    { to: '/dashboard', label: t('sidebar.home'), className: 'home' },
    { to: '/projects', label: t('sidebar.projects'), className: 'projects' },
    { to: '/requests', label: t('sidebar.requests'), className: '' },
    { to: '/clusterinfo', label: t('sidebar.clusterinfo'), className: '' },
    { to: '/settings', label: t('sidebar.settings'), className: '' },
  ];

  const requestedProjectsLink = {
    to: '/requestedprojects',
    label: t('sidebar.requestedprojects'),
    className: 'bottom-link',
  };

  const requestedUsersLink = {
    to: `${baseURL}/registry/co_petitions/index/co:2/sort:CoPetition.created/direction:desc/search.status:PA`,
    label: t('sidebar.requestedusers'),
    className: 'users-bottom-link',
  };

  return (
    <nav className="sidebar menu-sidebar left-1vw h-75vh w-13vw mt-5vh rounded-2vw d-flex flex-column justify-content-between">
      <ul className="nav flex-column top-8vh left-1vh">
        {sidebarLinks.map((link, index) => (
          <li key={index} className="nav-item">
            <Link to={link.to} className={`nav-link button mb-1vh w-12vw ${link.className}`}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      {isAdmin && (
        <>
        <div className={`left-1vh ${requestedUsersLink.className}`}>
          <a 
            href={requestedUsersLink.to} 
            className={`nav-link button w-12vw`}
            target="_blank" 
            rel="noopener noreferrer" 
            role="button"
          >
            {requestedUsersLink.label}
          </a>
        </div>
        <div className="left-1vh mb-2vh">
          <Link to={requestedProjectsLink.to} className={`nav-link button w-12vw ${requestedProjectsLink.className}`}>
            {requestedProjectsLink.label}
          </Link>
        </div>
        </>

        //
      )}
    </nav>
  );
};

export default sideBar;
