import { useState, useEffect } from 'react';
import Dashboard from '../layouts/dashboard';
import 'chart.js/auto';
import '../assets/css/experiments.css'
import SortableTable from "./components/SortableTable"


export default function Projects() {

    return (
        <Dashboard >

            <div className="tabela">
                {/* <SortableTable tableTitle=" " /> */}
            </div>

        </Dashboard>
    );
}
