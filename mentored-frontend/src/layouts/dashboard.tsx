import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Footer from '../pages/components/Footer';
import Header from '../pages/components/Header';
// import SideBar from '../pages/SideBar';
import SideBar from '../pages/components/SideBar';
import 'chart.js/auto';
import '../assets/css/dashboard-layout.css';


export default function Dashboard(props: { children: React.ReactNode }) {

  return (
    <div className="h-5/6">
      <div className="dashboard-rectangle" />
      <Header />
      <div className="container-fluid">
        <div className="row">
          <aside className="col-md-2">
            <SideBar />
          </aside>
          <main className="col-md-9">
            {props.children}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
