import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Dashboard from '../layouts/dashboard';
import { useTranslation } from 'react-i18next';
import 'chart.js/auto';
import '../assets/css/experiments.css'
import SortableTable from "./components/SortableTable"
import PopUp from "./components/NewExecution";
import ExperimentDefinitionYAMLView from '../components/core/ExperimentDefinitionYAMLView';
import { RiCheckboxBlankCircleFill } from "react-icons/ri";
import { FiDownload } from "react-icons/fi";
import { TiDeleteOutline } from "react-icons/ti";

import { mentored_api } from "../utils/useAxios";

import ExperimentExecutionMonitor from "../components/core/ExperimentExecutionMonitor";
import CRUDButton from '../components/core/CRUDButton';
import ConfirmationButton from '../components/core/Confirmation';
import ProgressBar from './components/ProgressBar';
import { GiReturnArrow } from "react-icons/gi";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import ExperimentExecutionStatus from './components/ExperimentExecutionStatus';

const DEV = import.meta.env.DEV;


export default function Executions() {
    localStorage.setItem('isExperimentMonitorOpen', "");
    localStorage.setItem('isNewExperimentExecutionOpen', "");

    const { t } = useTranslation();
    const { state } = useLocation();
    const project_id = state.row.id;
    const project_name = state.row.project_name;
    const viewOnlyMode = state.viewOnlyMode;

    const textRef = useRef(null);

    const experiment_id = state.experimentRow.id;
    const [experimentdata, setExperimentData] = useState(state.experimentRow);

    useLayoutEffect(() => {
        const adjustFontSize = () => {
            const element = textRef.current;
            if (element) {  
                const parentWidth = element.parentNode.parentNode.parentNode.offsetWidth;
                let fontSize = 2; // Starting font size in pixels
                const minFontSize = 0.5; // Minimum font size in pixels

                element.style.fontSize = `${fontSize}vw`;
                while (element.scrollWidth + 50 > parentWidth && fontSize > minFontSize) {
                    fontSize -= 0.10;
                    element.style.fontSize = `${fontSize}vw`;
                }
            }
        };
        mentored_api.get_experiment_definition(experiment_id, setExperimentData, (d) => {});

        adjustFontSize();
        window.addEventListener('resize', adjustFontSize);

        return () => {
            window.removeEventListener('resize', adjustFontSize);
        };
    }, [project_name, experimentdata.exp_name]);

    let create_col_prototype = (row) => {
        let data_size_as_mb = (row.experiment_data_size/(Math.pow(1024, 2))).toFixed(2);
        return [
            <td className='col-md-2 text-center'>{get_sortable_name(row)}</td>,
            !viewOnlyMode && (
                <td className='col-md-3 text-center' >
                    {row.progress < 100 &&
                        <ExperimentExecutionMonitor ee_id={row.id} className='table-icons' />
                    }
                </td>
            ),
            <td className='col-md-2 text-center'>
                <ExperimentExecutionStatus row={row}/>
            </td>,
            <td className='col-md-3 text-center'>
                {row.experiment_data_size > 0 && 
                    <CRUDButton operation='download'
                        name={get_sortable_name(row)}
                        suffixText={data_size_as_mb + " MB"}
                        triggerFunction={() => {
                            var urlDownload = "/api/experimentexecutions/"+row.id+"/download_data/";
                            window.open(urlDownload, '_blank');
                        }}
                />}
            </td>,
            !viewOnlyMode && (
                <td className='col-md-2 text-center'><CRUDButton operation='delete'
                                                    name={get_sortable_name(row)}
                                                    triggerFunction ={() => {
                                                        mentored_api.delete_experiment_execution(row.id, (d) => {
                                                        window.location.reload(false);
                                                        });
                                                    }}
                /></td>
            )
        ]
    }

    let create_header_prototype = () => {
        return [
            <td className='col-md-2 text-label text-center' ><b>{t('table.execution')}</b></td>,
            !viewOnlyMode && (
                <td className='col-md-3 text-label text-center'><b>{t('table.monitor')}</b></td>
            ),
            <td className='col-md-2 text-label text-center' ><b>{t('table.status')}</b></td>,
            <td className='col-md-3 text-label text-center' ><b>{t('table.logs')}</b></td>,
            !viewOnlyMode && (
                <td className='col-md-2 text-label text-center' ><b>{t('table.delete')}</b></td>
            )
        ]
    }

    const get_sortable_name_execution = (row) => [t('newexecution.execution') + row.id.toString()];

    let get_sortable_name = (row) => {
        return t('newexecution.execution') + row.id.toString();
    }


    const generateData = (num) => {
        const data = [];
        for (let i = 0; i < num; i++) {
          data.push({
            id: i + 1,
          });
        }
        return data;
      };

    const get_dataTable = (setState, cb) => {
        mentored_api.get_experiment_executions(experiment_id, setState, (d) => { cb(d) });
    };

    return (
        <Dashboard >
            <div className='container-fluid top-5'>
                <div className='row col-md-12 justify-content-between'>
                <Link to='/experiments/' state={{ row: state.row, viewOnlyMode: viewOnlyMode }} className="left-7 title-option title top-5 col-md-8 h-10vh text-decoration-none">
                    <div className='d-flex justify-content-between align-items-center text-decoration-none title'>
                        <h1 className='top-2.5vh d-flex align-items-center'>
                            <span ref={textRef} className="text-dynamic">
                                {project_name} <MdOutlineKeyboardArrowRight /> {experimentdata.exp_name}
                            </span>
                        </h1>
                        <h1 className='top-2.5vh'>
                            <GiReturnArrow />
                        </h1>
                    </div>
                </Link>
                <div className='right-1 col-md-1 top-5 h-10vh button-text text-center'>
                    <ExperimentDefinitionYAMLView
                    exp={experimentdata}
                    viewOnlyMode={viewOnlyMode}
                    onSaveCallback={(edited_yaml) => {
                        mentored_api.get_experiment_definition(experiment_id, setExperimentData, (d) => {});
                    }}
                    iconAsTitle={true}/>
                </div>

                {!viewOnlyMode &&
                    <div className='right-1 col-md-2'>
                        <PopUp projectId={project_id} experimentId={experiment_id}/>
                    </div>
                }
                </div>
                <div className='row col-md-12 top-10'>
                    <div className="table-size col-md-12">
                        <SortableTable 
                        get_sortable_name={get_sortable_name_execution} 
                        get_dataTable={(setState, cb) => get_dataTable(setState, (data) => cb(data))} 
                        tableTitle={t('table.execute')}
                        reloadTime={5000}
                        create_col_prototype={create_col_prototype} 
                        create_header_prototype={create_header_prototype} 
                        maxHeight={'540px'}
                        sortByName={true}
                        />
                    </div>
                </div>
            </div>
        </Dashboard>
    );
}
