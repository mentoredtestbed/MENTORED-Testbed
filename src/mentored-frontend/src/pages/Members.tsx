import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TiDeleteOutline, TiPencil } from 'react-icons/ti';

import 'chart.js/auto';
import '../assets/css/experiments.css';
import '../assets/css/tabela.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import NewMemberButton from './components/NewMember';
import SortableTable from './components/SortableTable';

import CRUDButton from '../components/core/CRUDButton';
import ExperimentDefinitionYAMLView from '../components/core/ExperimentDefinitionYAMLView';
import Dashboard from '../layouts/dashboard';
import { mentored_api } from '../utils/useAxios';
import MemberInfo from './components/MemberInfo';
import { GiReturnArrow } from "react-icons/gi";
import Loading from './components/Loading';

const { DEV } = import.meta.env;

export default function Members() {

  const { t } = useTranslation();
  const navigate = useNavigate();

  const { state } = useLocation();
  const project_id = state.row.id;
  const project_name = state.row.project_name;
  const [userRole, setUserRole] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(()=> {
    let login_data = JSON.parse(localStorage.getItem('login_data') || '');
    setUserEmail(login_data?.user?.email);

    get_user_role(() => {}, (response) => {
      if(response){
        setUserRole(response.user_role);
      }
    })
    
  }, []);

  const user_role_translation = (role) => {
    if(role == "Project Leader"){
      return 'roleOne';
    }else if(role == "Project Manager"){
      return 'roleTwo';
    }else if(role == "Experimenter"){
      return 'roleThree';
    }
    return 'Error';
  }

  const views_edit_user_role_condition = (row) => {
    let viewOnlyCondition = false;
    if(userRole == row.external_data.UserRole){
      viewOnlyCondition = true;
    }else{
      if(userRole == "Project Leader" || userRole == "Project Manager"){
        if(row.external_data.UserRole == "Project Leader" && userRole == "Project Manager"){
          viewOnlyCondition = true;
        }else{
          viewOnlyCondition = false;
        }

      }else{
        if(row.external_data.UserRole == "Project Leader" || row.external_data.UserRole == "Project Manager"){
          viewOnlyCondition = true;
        }
      }
    }
    return (<div style={{ display: "inline-block" }}>
      <MemberInfo userInfo={row} viewOnly={viewOnlyCondition} projectId={project_id}/>
    </div>)
  }

  const delete_user_role_condition = (row) => {
    let deleteCondition = (
    <td className="col-md-3 text-center">
      { userEmail == row.email ?
        <CRUDButton
        operation="leave"
        name={""}
        triggerFunction={() => {
          mentored_api.remove_project_member(row.id, project_id, (d) => {
            navigate('/projects');
          });
        }}
        />
        :
        <CRUDButton
        operation="remove"
        name={row.external_data.Given + ' ' + row.external_data.Family}
        triggerFunction={() => {
          mentored_api.remove_project_member(row.id, project_id, (d) => {
            window.location.reload(false);
          });
        }}
        />
      }
    </td>);

    let empty_column = (
      <td className="col-md-3 text-center">
      </td>
    );
    if(userRole == row.external_data.UserRole){
      if(userRole != "Project Leader"){
        if(userEmail == row.email){
          return deleteCondition;
        }else {
          return empty_column;
        }
      }else{
        return empty_column;
      }
    }else{
      if(row.external_data.UserRole == "Project Leader" && (userRole == "Project Manager" || userRole == "Experimenter")){
        return empty_column;
      }else if(row.external_data.UserRole == "Project Manager" && userRole == "Experimenter"){
        return empty_column;
      }else{
        return deleteCondition;
      }
    }
  }

  const create_col_prototype = (row) => [
    <td className="col-md-3 text-center">{row.external_data.Given + ' ' + row.external_data.Family }</td>,
    <td className="col-md-3 text-center">
      {t(`memberinfo.${user_role_translation(row.external_data.UserRole)}`)}
    </td>,
    <td className="col-md-3 text-center" style={{ textAlign: "center" }}>
      {views_edit_user_role_condition(row)}
    </td>,
    // <td className='col-md-3 text-center'><TiPencil className=' table-icons' /></td>,
    <>
      {delete_user_role_condition(row)}
    </>
  ];

  const get_sortable_name = (row) => [row.external_data.Given, row.external_data.UserRole];

  const create_header_prototype = () => [
    <td className="col-md-3 text-label text-center">
      <b>{t('table.userName')}</b>
    </td>,
    <td className="col-md-3 text-label text-center">
    <b>{t('table.role')}</b>
    </td>,
    <td className="col-md-3 text-label text-center">
      {(userRole == "Project Leader" || userRole == "Project Manager") ? 
          <b>{t('table.edit')}</b>
        :
          <b>{t('table.visualize')}</b>
      }
    </td>,
    <td className="col-md-3 text-label text-center">
      <b>{t('table.remove')}</b>
    </td>
  ];




  const generateData = (num) => {
    const data = [];
    for (let i = 0; i < num; i++) {
      data.push({
        user_name: `User ${i + 1}`,
        user_role: `Role ${i + 1}`
      });
    }
    return data;
  };

  const get_user_role = (setState, cb) => {
    mentored_api.get_project_user_role(project_id, setState, (d) => {
      cb(d);
    });
  };

  const get_dataTable = (setState, cb) => {
    mentored_api.get_project_members(project_id, setState, (d) => {
      cb(d);
    });
  };



  return (
    <Dashboard>
        {userRole != '' ? 
          <div className='container-fluid top-5'>
            <div className='row col-md-12 justify-content-between'>
                <Link to='/experiments' state={{ row: state.row }} className="left-7 title title-option top-5 col-md-8 h-10vh text-decoration-none">
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
                {(userRole == 'Project Leader' || userRole == 'Project Manager') &&
                <div className='right-4 col-md-2'>
                    <NewMemberButton projectId={project_id} projectName={project_name}/>
                </div>
                }
            </div>
            <div className='row col-md-12 top-10'>
                <div className="table-size col-md-12">
                    <SortableTable 
                    get_sortable_name={get_sortable_name} 
                    get_dataTable={(setState, cb) => get_dataTable(setState, (data) => cb(data))} 
                    tableTitle={t('table.members')} 
                    create_col_prototype={create_col_prototype} 
                    create_header_prototype={create_header_prototype} 
                    maxHeight={'525px'}
                    />
                </div>
            </div>
          </div>
          :
          <Loading insideTable={false}/>
        }
    </Dashboard>
  );
}
