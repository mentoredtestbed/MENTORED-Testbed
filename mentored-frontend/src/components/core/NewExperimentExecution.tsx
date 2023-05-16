import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// import React from 'react';

import { mentored_api } from "../../utils/useAxios";
// import 'bootstrap/dist/css/bootstrap.min.css';


import '../../assets/css/NewDefinition.css';
import '../../assets/css/NewExecution.css';


const NewExperimentDefinition = () => {

  // a local state to store the currently selected file.
  const [experiment_def_id, setExperiment_def_id] = React.useState(null);
  const [project_id, setProject_id] = React.useState(null);
  const [execution_time, seExecution_time] = React.useState(null);

  const [exp_list, setExp_list] = React.useState([]);
  const [project_list, setProject_list] = React.useState([]);

  const { t } = useTranslation();

  useEffect(() => {
    mentored_api.get_experiments_definitions(setExp_list, (d) => { setExperiment_def_id(d[0].id) });
    mentored_api.get_projects(setProject_list, (d) => { setProject_id(d[0].id) });
    seExecution_time(300);
  }, []);


  console.log("A");

  const handleSubmit = async (event) => {
    event.preventDefault();

    mentored_api.post_new_experiment_execution(project_id, experiment_def_id, execution_time,
      (response) => {
        window.location.reload(false);
      });
    // console.log(project_id, experiment_def_id, execution_time);

  }

  const handleInputChangedExperiment_def_id = (event) => {
    setExperiment_def_id(event.target.value);
  }

  const handleInputChangedProject_id = (event) => {
    setProject_id(event.target.value);
  }

  const handleInputChangedExecution_time = (event) => {
    seExecution_time(event.target.value);
  }

  let select_experiment = exp_list.map((item, i) => {
    return (
      <option key={i} value={item.id}>
        {item.exp_name}
      </option>
    );
  });


  let select_project = project_list.map((item, i) => {
    return (
      <option key={i} value={item.id}>
        {item.project_name}
      </option>
    );
  });

  return (
    <form className='upload col-md-12 content-popup-executions' onSubmit={handleSubmit}>
      <div className='row'>
        <div className="col-md-4 label">{t('newexecution.definition')}</div>
        {/* <div className="col-md-2"><input className='file-upload' type="file" onChange={handleFileSelect}/></div> */}
        <div className="col-md-2">
          <select className='project-selection action-button' onChange={handleInputChangedExperiment_def_id}>
            {select_experiment}
          </select>
        </div>
      </div>

      <p className='col-md-12'>&nbsp;</p>

      <div className='row'>
        <div className="col-md-4 label">{t('newexecution.project')}</div>
        {/* <div className="col-md-2"><input className='file-upload' type="file" onChange={handleFileSelect}/></div> */}
        <div className="col-md-2">
          <select className='project-selection action-button' onChange={handleInputChangedProject_id}>
            {select_project}
          </select>
        </div>
      </div>

      <p className='col-md-12'>&nbsp;</p>

      <div className='row'>
        <div className="col-md-4 label">{t('newexecution.time')}</div>
        {/* <div className="col-md-2"><input className='file-upload' type="file" onChange={handleFileSelect}/></div> */}
        <div className="col-md-2">
          <input type='number' className="action-button" value={execution_time} onChange={handleInputChangedExecution_time}></input>
        </div>
      </div>

      <p className='col-md-12'>&nbsp;</p>
      <div className="col-md-12"><button type="submit" className="action-button">{t('newexecution.execute')}</button></div>


    </form>


    // <form className='upload'>
    //   <input type="file" className='file-upload'/>
    //   <button type="submit" className='file-submit'>Upload (YAML format)</button>
    // </form>
  )
};

export default NewExperimentDefinition;