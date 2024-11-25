import { useTranslation } from 'react-i18next';
import 'chart.js/auto';
import '../assets/css/experiments.css';
import '../assets/css/tabela.css';
import {useLocation } from 'react-router-dom';
import SortableTable from './components/SortableTable';
import Dashboard from '../layouts/dashboard';
import { mentored_api } from '../utils/useAxios';
import { useState, useEffect } from 'react';
import { AiOutlineCloseSquare } from "react-icons/ai";
import Plot from 'react-plotly.js';
import '../assets/css/NewDefinition.css';
import '../assets/css/NewExecution.css';


const { DEV } = import.meta.env;


function ClusterInfoGraph({ cluster_info, worker_name }) {
  const [showPopup, setShowPopup] = useState(false);

  const handleButtonClick = () => {
    localStorage.setItem('isClusterInfoGraphOpen', "true");
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    localStorage.setItem('isClusterInfoGraphOpen', "");
    setShowPopup(false);
  }

  useEffect(() => {
    document.addEventListener("keydown", escFunction, false);
  }, []);

  const escFunction = (event) => {
    if (event.key === "Escape" && showPopup) {
      handleClosePopup();
    }
  }

  const { t } = useTranslation();

  const title = worker_name;
  const description = t('newexecution.description');
  let x_axis = [];
  let y_axis = [];
  let y_axis2 = [];
  for (let i = 0; i < cluster_info.length; i++) {
    for(let j = 0; j < cluster_info[i]['workers_data']['workers'].length; j++) {
      if (cluster_info[i]['workers_data']['workers'][j]['node_name'] == worker_name) {
        x_axis.push(cluster_info[i]['last_update']);
        y_axis.push(cluster_info[i]['workers_data']['workers'][j]['cpu_percent']);
        y_axis2.push(cluster_info[i]['workers_data']['workers'][j]['memory_percent']);
      }
    }
  }

  let selectorOptions = {
      buttons: [
      {
          step: 'hour',
          stepmode: 'backward',
          count: 1,
          label: '1h'
      }, {
          step: 'hour',
          stepmode: 'backward',
          count: 6,
          label: '6h'
      }, {
          step: 'hour',
          stepmode: 'backward',
          count: 12,
          label: '12h'
      }, {
          step: 'hour',
          stepmode: 'backward',
          count: 24,
          label: '24h'
      },
      {
          step: 'month',
          stepmode: 'backward',
          count: 1,
          label: '1m'
      }, {
          step: 'month',
          stepmode: 'backward',
          count: 6,
          label: '6m'
      }, {
          step: 'year',
          stepmode: 'todate',
          count: 1,
          label: 'YTD'
      }, {
          step: 'year',
          stepmode: 'backward',
          count: 1,
          label: '1y'
      }, {
          step: 'all',
      }],
  };

  let plotly_data = [
    {
      x: x_axis,
      y: y_axis,
      name: 'CPU Usage (%)',
      type: 'scatter',
      mode: 'lines+points',
      marker: {color: 'blue'},
    },
    {
      x: x_axis,
      y: y_axis2,
      name: 'Memory Usage (%)',
      type: 'scatter',
      mode: 'lines+points',
      marker: {color: 'red'},
      yaxis: 'y2',
    }
  ];

  let plotly_layout = {
    title: 'CPU Usage (%)',
    xaxis: {
      title: 'Time',
      rangeselector: selectorOptions,
      rangeslider: {}
    },
    yaxis: {
      title: 'CPU Usage (%)',
      // rangeslider: { visible: true }, // Add rangeslider_visible property
    },
    yaxis2: {
      title: 'Memory Usage (%)',
      overlaying: 'y',
      side: 'right',
      // rangeslider: { visible: true }, // Add rangeslider_visible property
    },
  };

  let plotly_config = {
    responsive: true,
    displayModeBar: true,
  };

  let plotly_style = {
    width: '100%',
    height: '100%',
  };

  let plotly_div = (
    <Plot
      data={plotly_data}
      layout={plotly_layout}
      config={plotly_config}
      style={plotly_style}
    />
  );

  return (

    <div>
      {showPopup ? (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className='popup-title-header'>
              <h2 className='popup-title-container'>
                {title}
              </h2>
              <AiOutlineCloseSquare onClick={handleClosePopup} className="close-button" />
            </div>

            <div className="background-rectangle-Execution w-100%">
              <p className='popup-text-container '>
                {/* {description}  <a href={tutorial_url}>{tutorial_url_display}</a> */}
                {plotly_div}
              </p>
            </div>

            {/* <NewExperimentExecution projectId={projectId} experimentId={experimentId}/> */}
          </div>
        </div>
      ) : null}
      <button
        onClick={handleButtonClick}
        className="title-option newrequest-newdefinition-button h-10vh button-text text-center"
      >
        {worker_name}
      </button>
    </div>
  );
}


export default function ClusterInfo() {
  const { t } = useTranslation();

  const { state } = useLocation();
  const [cinfo_data, setCinfoData] = useState({});

  const create_col_prototype = (row) => {
    let bgcolorCpu = '';
    let cpu_percent = parseInt(row.cpu_percent);
    if (cpu_percent > 75) {
      bgcolorCpu = 'bg-danger text-light';
    } else if (cpu_percent > 25) {
      bgcolorCpu = 'bg-warning';
    } else {
      bgcolorCpu = '';
    }

    let bgcolorMemory = '';
    let memory_percent = parseInt(row.memory_percent);
    if (memory_percent > 75) {
      bgcolorMemory = 'bg-danger text-light';
    } else if (memory_percent > 25) {
      bgcolorMemory = 'bg-warning';
    } else {
      bgcolorMemory = '';
    }
    
    const ncores_used = row.ncores_used.toFixed(1);
    const ncores = row.ncores.toFixed(1);

    return [
      <td className={`col-md-3 text-center`}>
        <ClusterInfoGraph worker_name={row.node_name} cluster_info={cinfo_data}/>
      </td>,
      <td className={`col-md-2 text-center ${bgcolorCpu}`}>
        {ncores_used} / {ncores}
      </td>,
      <td className={`col-md-2 text-center ${bgcolorCpu}`}>
        {row.cpu_percent}
      </td>,
      <td className={`col-md-3 text-center ${bgcolorMemory}`}>
        {row.memory_usage_gb} GB / {row.memory_capacity_gb} GB
      </td>,
      <td className={`col-md-2 text-center ${bgcolorMemory}`}>
        {row.memory_percent}
      </td>,
    ];
  }

  const get_sortable_name = (row) => [row.node_name];

  const create_header_prototype = () => [
    <td className="col-md-3 text-label text-center">
      <b>{t('clusterinfo.node')}</b>
    </td>,
    <td className="col-md-2 text-label text-center">
      <b>{t('clusterinfo.cpu')}</b>
    </td>,
    <td className="col-md-2 text-label text-center">
      <b>{t('clusterinfo.cpupercent')}</b>
    </td>,
    <td className="col-md-3 text-label text-center">
      <b>{t('clusterinfo.memory')}</b>
    </td>,
    <td className="col-md-2 text-label text-center">
      <b>{t('clusterinfo.memorypercent')}</b>
    </td>,
  ];

  const generateData = (num) => {
    const data = [];
    for (let i = 0; i < num; i++) {
      data.push({
        node_name: `Node ${i + 1}`,
        cpu_usage: `${Math.floor(Math.random() * 100)}%`,
        memory_usage: `${Math.floor(Math.random() * 100)}%`,
        memory_usage_gb: `${Math.floor(Math.random() * 100)}`,
        cpu_capacity: `${Math.floor(Math.random() * 100)}%`,
        memory_capacity: `${Math.floor(Math.random() * 100)}%`,
        cpu_percent: `${Math.floor(Math.random() * 100)}%`,
        memory_percent: `${Math.floor(Math.random() * 100)}%`,
        ncores: `${Math.floor(Math.random() * 100)}`,
        ncores_used: `${Math.floor(Math.random() * 100)}`,
      });
    }
    return data;
  };

  const get_dataTable = (setState, cb) => {
    mentored_api.get_cluster_info(setState, (d) => {
      setCinfoData(d["data"]);
      let ci_data = d["data"];
      let last_ci = ci_data[ci_data.length - 1];
      cb(last_ci["workers_data"]["workers"]);
    });
  };

  return (
    <Dashboard>
      <div className="container-fluid top-5">
        <div className="row top-10 col-md-12">
          <div className="table-size col-md-12">
            <SortableTable
              get_sortable_name={get_sortable_name}
              get_dataTable={(setState, cb) => get_dataTable(setState, (data) => cb(data))}
              tableTitle={t('clusterinfo.clusterinfo')}
              create_col_prototype={create_col_prototype}
              create_header_prototype={create_header_prototype}
              maxHeight={'525px'}/>
          </div>
        </div>
      </div>
    </Dashboard>
  );
}
