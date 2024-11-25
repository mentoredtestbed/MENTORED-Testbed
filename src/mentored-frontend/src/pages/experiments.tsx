import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TiDeleteOutline, TiPencil } from 'react-icons/ti';

import 'chart.js/auto';
import '../assets/css/experiments.css';
import '../assets/css/tabela.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import PopUp from './components/NewDefinition';
import SortableTable from './components/SortableTable';

import CRUDButton from '../components/core/CRUDButton';
import ExperimentDefinitionYAMLView from '../components/core/ExperimentDefinitionYAMLView';
import Dashboard from '../layouts/dashboard';
import { mentored_api } from '../utils/useAxios';
import { FaTruckLoading } from 'react-icons/fa';
import { IoMdReturnLeft } from "react-icons/io";
import { GiReturnArrow } from "react-icons/gi";



const { DEV } = import.meta.env;

export default function Experiments() {
  const { t } = useTranslation();

  const { state } = useLocation();
  const project_id = state.row.id;
  const project_name = state.row.project_name;
  const viewOnlyMode = state.viewOnlyMode;

  //const projectTitle = `${t('table.project')} 1`;
  const create_col_prototype = (row) => [
    <td className="col-md-4 text-center"><Link to={'/execution'} state={{ row: state.row, experimentRow: row, viewOnlyMode: viewOnlyMode }}>{row.exp_name}</Link></td>,
    <td className="col-md-4 text-center">
      <ExperimentDefinitionYAMLView exp={row} viewOnlyMode={viewOnlyMode} />
    </td>,
    // <td className='col-md-3 text-center'><TiPencil className=' table-icons' /></td>,
    ...(!viewOnlyMode ? 
        [<td className="col-md-4 text-center">
          <CRUDButton
            operation="delete"
            name={row.exp_name}
            triggerFunction={() => {
              mentored_api.delete_experiment_definition(row.id, (d) => {
                window.location.reload(false);
              });
            }}
          />
        </td>
    ] : [])
  ];

  const get_sortable_name = (row) => [row.exp_name];

  const create_header_prototype = () => [
    <td className="col-md-4 text-label text-center">
      <b>{t('table.name')}</b>
    </td>,
    <td className="col-md-4 text-label text-center">
      {!viewOnlyMode ? <b>{t('table.edit_view')}</b> : <b>{t('table.visualize')}</b>}
      
    </td>,
    ...(!viewOnlyMode ? [
      <td className="col-md-4 text-label text-center" key="delete">
        <b>{t('table.delete')}</b>
      </td>
    ] : [])
  ];

  const generateData = (num) => {
    const data = [];
    for (let i = 0; i < num; i++) {
      data.push({
        exp_name: `Experiment ${i + 1}`,
      });
    }
    return data;
  };

  const get_dataTable = (setState, cb) => {
    mentored_api.get_project_experiments(project_id, setState, (d) => {
      cb(d);
    });
  };



  return (
    <Dashboard>
      <div className="container-fluid top-5">
        <div className="pl-11 row col-md-12 justify-content-between">
          <Link to='/projects' className="top-5 title-option title col-md-6 h-11vh text-decoration-none">
            <div className="d-flex justify-content-between align-items-center h-100 text-decoration-none title">
              <div className="d-flex align-items-center h-100 text-decoration-none title">
                <h1 className="mb-0 text-decoration-none">
                  {project_name ? project_name : 'Loading...'}
                </h1>
              </div>
              <div className="d-flex align-items-center h-100 text-decoration-none title">
                <h1 className='text-decoration-none'>{project_name && <GiReturnArrow />}</h1>
              </div>
            </div>
          </Link>
          {!viewOnlyMode &&
          <>
            <Link 
              to="/members" 
              state={{ row: state.row }} 
              className="title title-option top-5 ml-1vw col-md-2 text-decoration-none d-flex justify-content-center align-items-center"
            >
                <h1 className="text-decoration-none text-decoration-none title">{t('table.members')}</h1>
            </Link>
            <div className="pr-8 col-md-2">
              <PopUp projectId={project_id}/>
            </div>
          </>
          }
        </div>
        <div className="row top-10 col-md-12">
          <div className="table-size col-md-12">
            <SortableTable
              get_sortable_name={get_sortable_name}
              get_dataTable={(setState, cb) => get_dataTable(setState, (data) => cb(data))}
              tableTitle={t('table.definitions')}
              create_col_prototype={create_col_prototype}
              create_header_prototype={create_header_prototype}
              maxHeight={'525px'}
              sortByName={false}
              />
          </div>
        </div>
      </div>
    </Dashboard>
  );
}
