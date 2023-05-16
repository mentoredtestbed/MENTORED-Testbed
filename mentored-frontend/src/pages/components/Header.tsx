import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/css/header.css';
import LogoMENTORED from '../../assets/img/logos/MENTORED-logo.png';
import { FiLogOut } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { FaRegEdit } from "react-icons/fa";
import { IoNotificationsCircleOutline } from "react-icons/io5";
import { useTranslation } from 'react-i18next';


export default function Header() {

  const { t } = useTranslation();

  let username = t('header.logout');
  let useremail = "";
  let logged = JSON.parse(localStorage.getItem('logged'));
  let login_data = JSON.parse(localStorage.getItem('login_data'));
  if (logged) {
    username = login_data.user.first_name;
    useremail = login_data.user.email;
  }
  let msgcontent = t('header.msgcontent');
  let msgtime = t('header.msgtime');
  let msgsender = t('header.msgsender');

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

                <div className="dropdown dropleft">
                  <IoNotificationsCircleOutline type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" className="notification-iconeStyle" />
                  <div className="dropdown-menu text-center navcolor" aria-labelledby="dropdownMenuButton">
                    <div className='container-fluid dropmsg'>

                      <div className='row msg-container'>
                        <div className='dropdown-item'>
                          <div className='col-auto'>
                            <div className='msg-info'>
                              <p className='msgcontent'>{msgcontent}</p>
                              <p className='msgtime'>{msgtime}</p>
                              <p className='msgsender'>{msgsender}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </li>

              <li className='nav-item ml-1'>
                <div className={`${username}${useremail} user-data text-center text-capitalize`}>
                  {username}
                  <br />
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
                    <button className="dropdown-item btn-settings mb-2 " type="button"><a href="https://mentored-testbed.cafeexpresso.rnp.br/tutorial">{t('header.help')}</a></button>
                    <button className="dropdown-item btn-settings mb-2 " type="button"><a href="/messages">{t('header.messages')}</a></button>
                  </div>
                </div>
              </li>

              <li className="nav-item ml-1">
                <Link to="/">
                  <FiLogOut className="logout-iconeStyle" />
                </Link>
              </li>

            </ul>
          </div>
        </div>
      </div>
    </header>

  );
}