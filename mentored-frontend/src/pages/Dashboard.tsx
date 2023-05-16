import { useState, useEffect } from 'react';
import Dash from '../layouts/dashboard';
import { useTranslation } from 'react-i18next';
import DashboardCards from './DashboardCards'
import 'chart.js/auto';
import '../assets/css/dashboard.css'

export default function Dashboard() {


    return (
        <Dash >
            <DashboardCards />
        </Dash>
    );
}
