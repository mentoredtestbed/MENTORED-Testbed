import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import 'chart.js/auto';
import '../assets/css/experiments.css';
import '../assets/css/tabela.css';
import { BsQuestion } from 'react-icons/bs';
import { IoCheckmarkSharp } from 'react-icons/io5';
import { RiCloseLine } from 'react-icons/ri';

import NewRequestForm from './components/NewRequestForm';
import RequestdProjectDetails from './components/RequestedProjectDetails';
import RequestedProjectDetails from './components/RequestedProjectDetails';
import SortableTable from './components/SortableTable';

import CRUDButton from '../components/core/CRUDButton';
import ExperimentDefinitionYAMLView from '../components/core/ExperimentDefinitionYAMLView';
import Dashboard from '../layouts/dashboard';
import { mentored_api } from '../utils/useAxios';
import { SlEye } from 'react-icons/sl';
import { FaArrowDown } from "react-icons/fa";
import { FaArrowUp } from "react-icons/fa";
import { MdBlockFlipped } from "react-icons/md";
import { FaRegCheckCircle } from "react-icons/fa";

const { DEV } = import.meta.env;

export default function RequestedProjects() {
  const { t } = useTranslation();
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const createColPrototype = (row) => [
    <td
      className="col-md-2 text-center"
      onClick={() => setSelectedProject({ name: row.project_name, user: row.user_name, project_id: row.id })}
    >
      {row.project_name}
    </td>,
    <td className="col-md-2 text-center">{row.user_name}</td>, // use row.userName
    <td className="col-md-2 text-center">{row.project_request_subject}</td>, // use row.subject
    <td className="col-md-2 text-center">
      <SlEye onClick={() => setSelectedProject({ name: row.project_name, user: row.user_name, project_id: row.id })} className="table-icons" />
    </td>,
    <td className="col-md-2 text-center">
      {row.project_request_subject == 'Creation' ? (
        row.project_acceptance == 'Idle' ? (
          <>
            <IoCheckmarkSharp className=" table-icons" />
            <RiCloseLine className=" table-icons" />
          </>) 
          : row.project_acceptance == 'Accepted' ? (
            <IoCheckmarkSharp className=" table-icons" style={{ color: 'green' }} />)
          : row.project_acceptance == 'Rejected' ? (
            <RiCloseLine className=" table-icons" style={{ color: 'red' }} />)
          : null
      ):(
        <>
          {row.project_request_subject == 'Activation' && row.current_project_status == 'Activated' ? 
            <FaRegCheckCircle className=" table-icons" style={{ color: 'green' }} />
            : row.project_request_subject == 'Deactivation' && row.current_project_status == 'Deactivated' ?
            <MdBlockFlipped className=" table-icons" style={{ color: 'red' }} />
            : row.project_request_subject == 'Activation' && row.current_project_status == 'Deactivated' ?
            <FaRegCheckCircle className=" table-icons" />
            : row.project_request_subject == 'Deactivation' && row.current_project_status == 'Activated' ?
            <MdBlockFlipped className=" table-icons" />
            : null
          }
        </>
      )}
    </td>,
    <td className="col-md-2 text-center">
      <CRUDButton
        operation="delete"
        name={row.project_name}
        triggerFunction={() => {
          alert('Function not implemented');
        }}
      />
    </td>,
  ];

  // const handleProjectRequestAccepted = (row) => {
  //   let project_request_data = { ...row, project_acceptance: 'Accepted' };
  //   console.log(project_request_data);
  //   try {
  //     // Post new project and wait for it to complete
  //     mentored_api.post_new_project(project_request_data, (response) => {
  //       if(response.status == 201){ //created
  //         mentored_api.edit_project_acceptance(project_request_data, (editResponse) => {
  //           if(editResponse.status == 200){ // Ok
  //             window.location.reload(false);
  //           }else {
  //             console.error("Error editing project acceptance:", editResponse);
  //           }
  //         });
  //       }else {
  //         console.error("Error posting new project:", response);
  //       }
  //     });
  //   }catch(error){
  //     console.error("Error processing project request:", error);
  //   }
  // }

  // const handleProjectRequestRejected = (row) => {
  //   let project_request_data = { ...row, project_acceptance: 'Rejected' };
  //   console.log(project_request_data);
  //   mentored_api.edit_project_acceptance(project_request_data, (response) => {
  //     if(response.status == 200){
  //       window.location.reload(false);
  //     }
      
  //   });
  // }

  const getSortableNameMyProjects = (row: { project_name: string, user_name: string, project_request_subject: string}) => [row.project_name, row.user_name, row.project_request_subject];

  const myProjectsHeader = () => [
    <td className="col-md-2 text-label text-center">
      <b>{t('table.projectname')}</b>
    </td>,
    <td className="col-md-2 text-label text-center">
      <b>{t('table.userName')}</b>
    </td>,
    <td className="col-md-2 text-label text-center">
      <b>{t('table.subject')}</b>
    </td>,
    <td className="col-md-2 text-label text-center">
      <b>{t('table.visualize')}</b>
    </td>,
    <td className="col-md-2 text-label text-center">
      <b>{t('table.status')}</b>
    </td>,
    <td className="col-md-2 text-label text-center">
      <b>{t('table.delete')}</b>
    </td>,
  ];

  const generateData = (num: number) => {
    const data = [];
    for (let i = 0; i < num; i += 1) {
      data.push({
        name: `Project ${i + 1}`,
        userName: `User Name ${i + 1}`,
        subject: `Creation ${i + 1}`,
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

  const handleRequestedClose = () => {
    setSelectedProject(false);
  };

  return (
    <Dashboard>
      <div style={{ display: 'flex', justifyContent: 'end' }}>
        {selectedProject && (
          <RequestedProjectDetails
            name={selectedProject.name}
            user={selectedProject.user}
            onRequestClose={handleRequestedClose}
            project_id={selectedProject.project_id}
          />
        )}
      </div>
      {!selectedProject && (
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
                maxHeight="69vh"
              />
            </div>
          </div>
        </div>
      )}
    </Dashboard>
  );
}
