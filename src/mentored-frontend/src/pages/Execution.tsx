import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Dashboard from '../layouts/dashboard';
import { useTranslation } from 'react-i18next';
import 'chart.js/auto';
import '../assets/css/experiments.css'
import SortableTable from "./components/SortableTable"
import PopUp from "./components/NewExecution";
import { RiCheckboxBlankCircleFill } from "react-icons/ri";
import { FiDownload } from "react-icons/fi";
import { TiDeleteOutline } from "react-icons/ti";

import { mentored_api } from "../utils/useAxios";

import ExperimentExecutionMonitor from "../components/core/ExperimentExecutionMonitor";
import CRUDButton from '../components/core/CRUDButton'

const DEV = import.meta.env.DEV;


export default function Executions() {
    const { t } = useTranslation();

    let projectTitle = t('table.project') + " 1";

    let create_col_prototype = (row) => {
        return [
            <td className='col-md-2 '>{get_sortable_name(row)}</td>,
            <td className='col-md-2 text-center ' ><ExperimentExecutionMonitor className='table-icons' /></td>,
            <td className='col-md-2 text-center'><RiCheckboxBlankCircleFill className='table-icons' style={{ color: row.status === -1 ? 'gray' : row.status === 4 ? 'green' : 'yellow' }} /></td>,
            <td className='col-md-2 text-center'><FiDownload className='table-icons' /></td>,
            // <td className='col-md-2 text-center'><TiDeleteOutline className='table-icons' /></td>
            <td className='col-md-2 text-center'><CRUDButton operation='delete'
                                                  name={get_sortable_name(row)}
                                                  triggerFunction={() => {
                                                    mentored_api.delete_experiment_execution(row.id, (d) => {
                                                      window.location.reload(false);
                                                    });
                                                  }}
            /></td>
        ]
    }

    let create_header_prototype = () => {
        return [
            <td className='col-md-2 text-label ' ><b>{t('table.execution')}</b></td>,
            <td className='col-md-2 text-label text-center' ><b>{t('table.monitor')}</b></td>,
            <td className='col-md-2 text-label text-center' ><b>{t('table.status')}</b></td>,
            <td className='col-md-2 text-label text-center' ><b>{t('table.logs')}</b></td>,
            <td className='col-md-2 text-label text-center' ><b>{t('table.delete')}</b></td>
        ]
    }

    let get_sortable_name = (row) => {
        return t('newexecution.execution') + row.id.toString();
    }

    // const [exp_exec_list, setExpexec_list] = useState([]);
    // const [exp_exec_list, setExpexec_list] = useState([{"id":60,"project":6,"experiment":21,"status":4,"execution_time":300},{"id":59,"project":6,"experiment":21,"status":4,"execution_time":300},{"id":58,"project":6,"experiment":21,"status":4,"execution_time":300},{"id":57,"project":6,"experiment":21,"status":4,"execution_time":300},{"id":56,"project":6,"experiment":21,"status":-1,"execution_time":300},{"id":55,"project":6,"experiment":21,"status":-1,"execution_time":300},{"id":54,"project":6,"experiment":21,"status":-1,"execution_time":300},{"id":53,"project":6,"experiment":21,"status":4,"execution_time":300},{"id":52,"project":6,"experiment":21,"status":4,"execution_time":300},{"id":51,"project":6,"experiment":21,"status":4,"execution_time":300},{"id":50,"project":6,"experiment":21,"status":4,"execution_time":300},{"id":49,"project":6,"experiment":21,"status":4,"execution_time":300},{"id":48,"project":6,"experiment":20,"status":4,"execution_time":300},{"id":47,"project":6,"experiment":20,"status":4,"execution_time":300},{"id":46,"project":6,"experiment":20,"status":4,"execution_time":300},{"id":45,"project":6,"experiment":20,"status":4,"execution_time":300},{"id":44,"project":6,"experiment":20,"status":4,"execution_time":300},{"id":43,"project":6,"experiment":20,"status":4,"execution_time":300},{"id":42,"project":6,"experiment":20,"status":4,"execution_time":300},{"id":41,"project":6,"experiment":19,"status":4,"execution_time":300},{"id":40,"project":6,"experiment":19,"status":4,"execution_time":300},{"id":39,"project":6,"experiment":19,"status":4,"execution_time":300},{"id":38,"project":6,"experiment":19,"status":4,"execution_time":300},{"id":37,"project":6,"experiment":18,"status":-1,"execution_time":300},{"id":36,"project":6,"experiment":17,"status":-1,"execution_time":300},{"id":35,"project":6,"experiment":16,"status":4,"execution_time":300},{"id":34,"project":6,"experiment":15,"status":4,"execution_time":300},{"id":33,"project":6,"experiment":14,"status":4,"execution_time":300},{"id":32,"project":6,"experiment":14,"status":4,"execution_time":300},{"id":31,"project":6,"experiment":13,"status":4,"execution_time":300},{"id":30,"project":6,"experiment":13,"status":4,"execution_time":300},{"id":29,"project":6,"experiment":13,"status":4,"execution_time":300},{"id":28,"project":6,"experiment":12,"status":4,"execution_time":300},{"id":27,"project":6,"experiment":12,"status":4,"execution_time":300},{"id":26,"project":6,"experiment":12,"status":4,"execution_time":300},{"id":25,"project":6,"experiment":12,"status":4,"execution_time":300},{"id":24,"project":6,"experiment":12,"status":4,"execution_time":300},{"id":23,"project":6,"experiment":11,"status":4,"execution_time":300},{"id":22,"project":6,"experiment":4,"status":-1,"execution_time":300},{"id":21,"project":6,"experiment":10,"status":4,"execution_time":300},{"id":20,"project":1,"experiment":10,"status":-1,"execution_time":300},{"id":19,"project":6,"experiment":9,"status":-1,"execution_time":300},{"id":18,"project":6,"experiment":4,"status":-1,"execution_time":300},{"id":17,"project":1,"experiment":9,"status":-1,"execution_time":300},{"id":16,"project":1,"experiment":4,"status":-1,"execution_time":300},{"id":15,"project":1,"experiment":9,"status":-1,"execution_time":300},{"id":14,"project":1,"experiment":9,"status":-1,"execution_time":300},{"id":13,"project":1,"experiment":9,"status":-1,"execution_time":300},{"id":11,"project":2,"experiment":4,"status":-1,"execution_time":300},{"id":9,"project":1,"experiment":4,"status":4,"execution_time":300},{"id":10,"project":1,"experiment":4,"status":4,"execution_time":300},{"id":8,"project":1,"experiment":4,"status":4,"execution_time":300}]);

    let get_dataTable = (setState, cb) => {

        if (DEV) {
            let d = [{ "id": 60, "project": 6, "experiment": 21, "status": 0, "execution_time": 300 }, { "id": 59, "project": 6, "experiment": 21, "status": 4, "execution_time": 300 }, { "id": 58, "project": 6, "experiment": 21, "status": 4, "execution_time": 300 }, { "id": 57, "project": 6, "experiment": 21, "status": 4, "execution_time": 300 }, { "id": 56, "project": 6, "experiment": 21, "status": -1, "execution_time": 300 }, { "id": 55, "project": 6, "experiment": 21, "status": -1, "execution_time": 300 }, { "id": 54, "project": 6, "experiment": 21, "status": -1, "execution_time": 300 }, { "id": 53, "project": 6, "experiment": 21, "status": 4, "execution_time": 300 }, { "id": 52, "project": 6, "experiment": 21, "status": 4, "execution_time": 300 }, { "id": 51, "project": 6, "experiment": 21, "status": 4, "execution_time": 300 }, { "id": 50, "project": 6, "experiment": 21, "status": 4, "execution_time": 300 }, { "id": 49, "project": 6, "experiment": 21, "status": 4, "execution_time": 300 }, { "id": 48, "project": 6, "experiment": 20, "status": 4, "execution_time": 300 }, { "id": 47, "project": 6, "experiment": 20, "status": 4, "execution_time": 300 }, { "id": 46, "project": 6, "experiment": 20, "status": 4, "execution_time": 300 }, { "id": 45, "project": 6, "experiment": 20, "status": 4, "execution_time": 300 }, { "id": 44, "project": 6, "experiment": 20, "status": 4, "execution_time": 300 }, { "id": 43, "project": 6, "experiment": 20, "status": 4, "execution_time": 300 }, { "id": 42, "project": 6, "experiment": 20, "status": 4, "execution_time": 300 }, { "id": 41, "project": 6, "experiment": 19, "status": 4, "execution_time": 300 }, { "id": 40, "project": 6, "experiment": 19, "status": 4, "execution_time": 300 }, { "id": 39, "project": 6, "experiment": 19, "status": 4, "execution_time": 300 }, { "id": 38, "project": 6, "experiment": 19, "status": 4, "execution_time": 300 }, { "id": 37, "project": 6, "experiment": 18, "status": -1, "execution_time": 300 }, { "id": 36, "project": 6, "experiment": 17, "status": -1, "execution_time": 300 }, { "id": 35, "project": 6, "experiment": 16, "status": 4, "execution_time": 300 }, { "id": 34, "project": 6, "experiment": 15, "status": 4, "execution_time": 300 }, { "id": 33, "project": 6, "experiment": 14, "status": 4, "execution_time": 300 }, { "id": 32, "project": 6, "experiment": 14, "status": 4, "execution_time": 300 }, { "id": 31, "project": 6, "experiment": 13, "status": 4, "execution_time": 300 }, { "id": 30, "project": 6, "experiment": 13, "status": 4, "execution_time": 300 }, { "id": 29, "project": 6, "experiment": 13, "status": 4, "execution_time": 300 }, { "id": 28, "project": 6, "experiment": 12, "status": 4, "execution_time": 300 }, { "id": 27, "project": 6, "experiment": 12, "status": 4, "execution_time": 300 }, { "id": 26, "project": 6, "experiment": 12, "status": 4, "execution_time": 300 }, { "id": 25, "project": 6, "experiment": 12, "status": 4, "execution_time": 300 }, { "id": 24, "project": 6, "experiment": 12, "status": 4, "execution_time": 300 }, { "id": 23, "project": 6, "experiment": 11, "status": 4, "execution_time": 300 }, { "id": 22, "project": 6, "experiment": 4, "status": -1, "execution_time": 300 }, { "id": 21, "project": 6, "experiment": 10, "status": 4, "execution_time": 300 }, { "id": 20, "project": 1, "experiment": 10, "status": -1, "execution_time": 300 }, { "id": 19, "project": 6, "experiment": 9, "status": -1, "execution_time": 300 }, { "id": 18, "project": 6, "experiment": 4, "status": -1, "execution_time": 300 }, { "id": 17, "project": 1, "experiment": 9, "status": -1, "execution_time": 300 }, { "id": 16, "project": 1, "experiment": 4, "status": -1, "execution_time": 300 }, { "id": 15, "project": 1, "experiment": 9, "status": -1, "execution_time": 300 }, { "id": 14, "project": 1, "experiment": 9, "status": -1, "execution_time": 300 }, { "id": 13, "project": 1, "experiment": 9, "status": -1, "execution_time": 300 }, { "id": 11, "project": 2, "experiment": 4, "status": -1, "execution_time": 300 }, { "id": 9, "project": 1, "experiment": 4, "status": 4, "execution_time": 300 }, { "id": 10, "project": 1, "experiment": 4, "status": 4, "execution_time": 300 }, { "id": 8, "project": 1, "experiment": 4, "status": 4, "execution_time": 300 }];
            setState(d);
            cb(d);
        }
        else {
            mentored_api.get_experiments_executions(setState, (d) => { cb(d) });
        }
    }

    // useEffect(() => {
    //     mentored_api.get_experiments_executions(setExpexec_list, (d) => {});
    //   }, []);

    return (
        <Dashboard >
            <div className='container-fluid'>
                <div className='row'>
                    <div className='title top-5 col-md-10 h-10vh'>
                        <h1 className='top-2.5vh'>{projectTitle}</h1>
                    </div>
                    <div className='col-md-2'>
                        <PopUp />
                    </div>
                </div>
                <div className='row top-10'>
                    <div className="table-size col-md-12" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
                        <SortableTable get_sortable_name={get_sortable_name} get_dataTable={get_dataTable} tableTitle={t('table.execute')} create_col_prototype={create_col_prototype} create_header_prototype={create_header_prototype} />
                    </div>
                </div>
            </div>
        </Dashboard>
    );
}