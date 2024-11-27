import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import 'chart.js/auto';
import '../assets/css/experiments.css';
import '../assets/css/tabela.css';
import { BsQuestion } from 'react-icons/bs';
import { IoCheckmarkSharp } from 'react-icons/io5';
import { RiCloseLine } from 'react-icons/ri';

import NewRequestForm from './components/NewRequestForm';
import SortableTable from './components/SortableTable';

import CRUDButton from '../components/core/CRUDButton';
import ExperimentDefinitionYAMLView from '../components/core/ExperimentDefinitionYAMLView';
import Dashboard from '../layouts/dashboard';
import { mentored_api } from '../utils/useAxios';
import { SlEye } from 'react-icons/sl';
import RequestedProjectDetails from './components/RequestedProjectDetails';

const { DEV } = import.meta.env;

export default function Requests() {
  const { t } = useTranslation();
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const createColPrototype = (row) => [
    <td className="col-md-3 text-center" onClick={() => setSelectedProject({ name: row.project_name, user: row.user_name, project_id: row.id })}>{row.project_name}</td>,
      <td className="col-md-3 text-center">
        <SlEye onClick={() => setSelectedProject({ name: row.project_name, user: row.user_name, project_id: row.id })} className="table-icons" />
      </td>,
    <td className="col-md-3 text-center">
      {row.project_acceptance == 'Idle' && <BsQuestion className=" table-icons" />}
      {row.project_acceptance == 'Accepted' && <IoCheckmarkSharp className=" table-icons" style={{ color: 'green' }}/>}
      {row.project_acceptance == 'Rejected' && <RiCloseLine className=" table-icons" style={{ color: 'red' }}/>}
    </td>,
    <td className="col-md-3 text-center">
      <CRUDButton
        operation="delete"
        name={row.project_name}
        triggerFunction={() => {
          mentored_api.remove_project_request(row.id, (d) => {
            window.location.reload(false);
          });
          
        }}
      />
    </td>,
  ];

  const getSortableNameMyProjects = (row: { name: string }) => [row.project_name];

  const myProjectsHeader = () => [
    <td className="col-md-3 text-label text-center">
      <b>{t('table.projectname')}</b>
    </td>,
    <td className="col-md-3 text-label text-center">
      <b>{t('table.visualize')}</b>
    </td>,
    <td className="col-md-3 text-label text-center">
      <b>{t('table.status')}</b>
    </td>,
    <td className="col-md-3 text-label text-center">
      <b>{t('table.delete')}</b>
    </td>,
  ];

  const generateData = (num: number) => {
    const data = [];
    for (let i = 0; i < num; i += 1) {
      data.push({
        name: `Project ${i + 1}`,
        leader: `Leader ${i + 1}`,
      });
    }
    return data;
  };

  const getDataTable = (setState, cb) => {
    if (DEV) {
      const myProjectsData = generateData(10);
      setState({ myProjects: myProjectsData });
      cb({ myProjects: myProjectsData });
    } else {
      mentored_api.get_requested_projects(setState, (d) => {
        cb(d);
      });
    }
  };
  const handleRequestClose = () => {
    setShowNewRequest(false);
  };

  return (
    <Dashboard>
      <div style={{ display: 'flex', justifyContent: 'end' }}>
        {selectedProject ? (
              <RequestedProjectDetails
                name={selectedProject.name}
                user={selectedProject.user}
                onRequestClose={() => {setSelectedProject(false)}}
                project_id={selectedProject.project_id}
              />
        ) : (
          // <div className='container-fluid top-5'>
          <div className='row col-md-12 justify-content-end'>
            <div className="right-4 col-md-2">
              {!showNewRequest && (
                <button
                  className="newrequest-newdefinition-button top-5 h-11vh button-text text-center capitalize"
                  onClick={() => setShowNewRequest(true)}
                >
                  {t('newrequest.upButtonText')}
                  <br />
                  {t('newrequest.downButtonText')}
                </button>
              )}
            </div>
          </div>
        )}
        {showNewRequest && (
            <div className=" col-md-12">
              <NewRequestForm onRequestClose={handleRequestClose} />
            </div>
        )}  
      </div>
      {!showNewRequest && !selectedProject && (
        <div className="container-fluid">
          <div className="row top-10 mb-2">
            <div className="col-md-12">
              <SortableTable
                get_sortable_name={getSortableNameMyProjects}
                get_dataTable={(setState, cb) =>
                  getDataTable(setState, (data) => cb(data))
                }
                tableTitle={t('newrequest.requestedProjects')}
                create_col_prototype={createColPrototype}
                create_header_prototype={myProjectsHeader}
                maxHeight="58vh"
              />
            </div>
          </div>
        </div>
      )}
    </Dashboard>
  );
}
