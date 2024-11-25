import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import 'chart.js/auto';
import '../assets/css/experiments.css';
import '../assets/css/tabela.css';
import SortableTable from './components/SortableTable';

import CRUDButton from '../components/core/CRUDButton';
import ExperimentDefinitionYAMLView from '../components/core/ExperimentDefinitionYAMLView';
import Dashboard from '../layouts/dashboard';
import { mentored_api } from '../utils/useAxios';
import ProjectInfo from './components/ProjectInfo';
import { useEffect, useState } from 'react';
import Loading from './components/Loading';

const { DEV } = import.meta.env;

export default function Experiments() {
  const { t } = useTranslation();
  const [userRoleData, setUserRoleData] = useState(null);

  useEffect(() => {
    mentored_api.get_all_projects_user_role(() => {}, (data) => {
      setUserRoleData(data);
    });
  }, []);

  const create_col_prototype = (row) => {
    if (!row) {
      console.error('Row data is missing or invalid:', row);
      return null; // Handle cases where row might be undefined or invalid
    }

    const result = [
      <td key={`${row.id}-1`} className="col-md-3 text-center">
        {row.is_active ? 
          <Link to={'/experiments'} state={{ row: row, viewOnlyMode: false  }}> {row.project_name} </Link>
          :
          row.project_name
        }
      </td>,
      <td className="col-md-2 text-center custom-flex">{row.project_request.project_identifier}</td>,
      <td key={`${row.id}-2`} className="col-md-2 text-center">
        <ProjectInfo projectInfo={row} />
      </td>,
      <td key={`${row.id}-3`} className="col-md-3 text-center">{row.project_request.user_name}</td>,
      <td key={`${row.id}-4`} className="col-md-2 text-center">
        {userRoleData && userRoleData[row.id] == 'Project Leader' ?
          row.is_active ? 
            <CRUDButton
            operation="deactivate"
            name={row.project_name}
            triggerFunction={() => {
              let project_request_data = { ...row.project_request, project_request_subject: 'Deactivation'};
              console.log('Deactivation', project_request_data);
              mentored_api.post_new_project_request_action_status(project_request_data, (d) => {
                window.location.reload(false);
              });
            }}
            />
            :
            <CRUDButton
            operation="activate"
            name={row.project_name}
            triggerFunction={() => {
              let project_request_data = { ...row.project_request, project_request_subject: 'Activation' };
              console.log('Activation', project_request_data);
              mentored_api.post_new_project_request_action_status(project_request_data, (d) => {
                window.location.reload(false);
              });
            }}
            />
        :
        null
        }
        
        
      </td>,
    ];
    return result;
  };

  const create_col_prototype_public_projects = (row) => [
    <td className="col-md-3 text-center custom-flex">
      <Link to={'/experiments'} state={{ row: row, viewOnlyMode: true }}> {row.project_name} </Link>
    </td>,
    <td className="col-md-3 text-center custom-flex">{row.project_request.project_identifier}</td>,
    <td className="col-md-3 text-center custom-flex">
      <ProjectInfo projectInfo={row} />
    </td>,
    <td className="col-md-3 text-center custom-flex">{row.project_request.user_name}</td>,
    // <td className="col-md-2 text-center custom-flex">
    //   <CRUDButton
    //     operation="join"
    //     name={row.project_name}
    //     triggerFunction={() => {
    //       alert('Function not implemented');
    //     }}
    //   />
    // </td>,
  ];

  const get_sortable_name_public_projects = (row) => [row.project_name, row.project_request.project_identifier, row.project_request.user_name];
  const get_sortable_name_my_projects = (row) => [row.project_name, row.project_request.project_identifier, row.project_request.user_name];

  const myProjectsHeader = () => [
    <td className="col-md-3 text-label text-center">
      <b>{t('table.projectname')}</b>
    </td>,
    <td className="col-md-2 text-label text-center">
      <b>{t('table.identifier')}</b>
    </td>,
    <td className="col-md-2 text-label text-center">
      <b>{t('table.visualize')}</b>
    </td>,
    <td className="col-md-3 text-label text-center">
      <b>{t('table.leader')}</b>
    </td>,
    <td className="col-md-2 text-label text-center">
      <b>{t('table.actions')}</b>
    </td>,
  ];

  const publicProjectsHeader = () => [
    <td className="col-md-3 text-label text-center">
      <b>{t('table.projectname')}</b>
    </td>,
    <td className="col-md-3 text-label text-center">
      <b>{t('table.identifier')}</b>
    </td>,
    <td className="col-md-3 text-label text-center">
      <b>{t('table.visualize')}</b>
    </td>,
    <td className="col-md-3 text-label text-center">
      <b>{t('table.leader')}</b>
    </td>,
    // <td className="col-md-2 text-label text-center">
    //   <b>{t('table.join')}</b>
    // </td>,
  ];

  const generateData = (num) => {
    const data = [];
    for (let i = 0; i < num; i++) {
      data.push({
        name: `Project ${i + 1}`,
        leader: `Leader ${i + 1}`,
        identifier: `Identifier ${i + 1}`,
      });
    }
    return data;
  };

  const get_dataTable_my_projects = (setState, cb) => {
    mentored_api.get_projects(setState, (d) => {
      cb({ myProjects: d });
    });
  };

  const get_dataTable_public_projects = (setState, cb) => {
    mentored_api.get_public_projects(setState, (d) => {
      cb({ publicProjects: d });
    });
  };

  return (
    <Dashboard>
      {userRoleData ?
      <div className="container-fluid " style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 90px)' }}>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div className="row top-10" style={{ width: '100%'}}>
            <div className="col-md-12">
              <SortableTable
                get_sortable_name={get_sortable_name_my_projects}
                get_dataTable={(setState, cb) => get_dataTable_my_projects(setState, (data) => cb(data.myProjects))}
                tableTitle={t('table.myProjects')}
                create_col_prototype={create_col_prototype}
                create_header_prototype={myProjectsHeader}
                maxHeight={'300px'}
                sortByName={false}
              />
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div className="row" style={{ width: '100%'}}>
            <div className=" col-md-12">
              <SortableTable
                get_sortable_name={get_sortable_name_public_projects}
                get_dataTable={(setState, cb) => get_dataTable_public_projects(setState, (data) => cb(data.publicProjects))}
                tableTitle={t('table.publicProjects')}
                create_col_prototype={create_col_prototype_public_projects}
                create_header_prototype={publicProjectsHeader}
                maxHeight={'300px'}
                sortByName={false}
              />
            </div>
          </div>
        </div>
      </div>
      :
      <Loading insideTable={false}/>
      }
    </Dashboard>
  );
}
