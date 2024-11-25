import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/css/header.css';
import LogoMENTORED from '../../assets/img/logos/MENTORED-logo.png';
import { FiLogOut } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { FaRegEdit } from "react-icons/fa";
import { IoNotificationsCircleOutline } from "react-icons/io5";
import { useTranslation } from 'react-i18next';
import {mentored_api} from "../../utils/useAxios";

import NotificationPopup from '../../pages/components/NotificationPopup';

import { NotificationContent } from '../../pages/components/NotificationPopup';

export default function Header() {

  const { t } = useTranslation();

  let username = t('header.logout');
  let useremail = "";
  let logged = JSON.parse(localStorage.getItem('logged'));
  let login_data = JSON.parse(localStorage.getItem('login_data'));
  if (logged) {
    username = login_data.user.first_name;
    useremail = (login_data.user.email).toLowerCase();
  }
  let msgcontent = t('header.inviteMsg');
  let msgtime = t('header.msgtime');
  let msgsender = t('header.msgsender');
  const [notifications, setNotifications] = useState<NotificationContent[]>([]);
  

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        mentored_api.get_notifications(() => {},
          (data: NotificationContent[]) => {
            if(data.status == 200){
              setNotifications(data);
            }
          });
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
      }
    };
  
    fetchNotifications();
  
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 1000);
  
    return () => clearInterval(intervalId);
  }, []);

  let tutorial_url = mentored_api.baseURL+"/tutorial/";

  return (
    <header className="navbar navcolor navbar-dark bg-body-tertiary">
      <div className="container-fluid">

        <div className="d-flex align-items-center">
          <img src={LogoMENTORED} alt="Logo" className="w-3vw right-1 rounded-1vw " />
          <a className="navbar-brand tittle text-center">
            MENTORED
            <br />
            TESTBED
          </a>
        </div>

        <div>
          <div className="d-flex align-items-center">
            <ul className="nav nav-pills">
              <li className="nav-item">
                <NotificationPopup notifications={notifications} notificationCount={Array.isArray(notifications) ? notifications.filter(notification => !notification.read).length : 0}/>
              </li>
              <li className='nav-item ml-1'>
                <div className={`${username} user-data text-center username-lock`}>
                  {username}
                </div>
                <div className={`${useremail} user-data text-center`}>
                  {useremail}
                </div>
              </li>

              <li className='nav-item ml-2'>
                <FaUserCircle className="user-iconeStyle" />
              </li>

              <li className='nav-item ml-1'>
                <div className="dropdown dropleft ">
                  <FaRegEdit type="button" id="dropdownMenuButton " data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" className="settings-iconeStyle" />
                  <div className="dropdown-menu text-center navcolor" aria-labelledby="dropdownMenuButton">
                    <button className="dropdown-item btn-settings mb-2 " type="button"><a href="/settings">{t('header.settings')}</a></button>
                    <button className="dropdown-item btn-settings mb-2 " type="button"><a href={tutorial_url}>{t('header.help')}</a></button>
                    <button className="dropdown-item btn-settings mb-2 " type="button"><a href="/messages">{t('header.messages')}</a></button>
                  </div>
                </div>
              </li>

              <li className="nav-item ml-1">
                    <a href="/api/logout/">
                        <FiLogOut className="logout-iconeStyle" />
                    </a>
              </li>

            </ul>
          </div>
        </div>
      </div>
    </header>

  );
}