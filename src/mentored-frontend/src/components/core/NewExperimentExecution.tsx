import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// import React from 'react';

import { mentored_api } from '../../utils/useAxios';
// import 'bootstrap/dist/css/bootstrap.min.css';

import '../../assets/css/NewDefinition.css';
import '../../assets/css/NewExecution.css';

function NewExperimentDefinition({ projectId, experimentId}) {
  // a local state to store the currently selected file.
  // const [experiment_def_id, setExperiment_def_id] = React.useState(null);
  // const [project_id, setProject_id] = React.useState(null);
  const [execution_time, setExecution_time] = React.useState(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // const [exp_list, setExp_list] = React.useState([]);
  // const [project_list, setProject_list] = React.useState([]);

  const { t } = useTranslation();

  useEffect(() => {
    setIsSubmitting(false);
    setExecution_time(300);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    mentored_api.post_new_experiment_execution(projectId, experimentId, execution_time,
      (response) => {
        window.location.reload(false);
        setIsSubmitting(false);
      });
  }

  const handleInputChangedExecution_time = (event) => {
    setExecution_time(event.target.value);
  };

  return (
    <form className="upload col-md-12 content-popup-executions" onSubmit={handleSubmit}>
      <p className="col-md-12">&nbsp;</p>
      <p className="col-md-12">&nbsp;</p>
      <div className="row">
        <div className="col-md-4 label">{t('newexecution.time')}</div>
        {/* <div className="col-md-2"><input className='file-upload' type="file" onChange={handleFileSelect}/></div> */}
        <div className="col-md-2">
          <input
            type="number"
            className="action-button"
            value={execution_time}
            onChange={handleInputChangedExecution_time}
          />
        </div>
      </div>

      <p className="col-md-12">&nbsp;</p>
      <div className="col-md-12">
        <button type="submit" className="action-button" disabled={isSubmitting}>
          {t('newexecution.execute')}
        </button>
      </div>
    </form>

  )
};

export default NewExperimentDefinition;
