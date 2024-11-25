import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { mentored_api } from '../../utils/useAxios';
import '../../assets/css/NewDefinition.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';

function NewExperimentDefinition({ projectId }) {
  // a local state to store the currently selected file.
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [exp_name, setExp_name] = React.useState(null);
  // const [project_id, setProject_id] = React.useState(null);
  // const [project_list, setProject_list] = React.useState([]);
  const [execution_time, setExecution_time] = React.useState(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const { t } = useTranslation();

  useEffect(() => {
    setIsSubmitting(false);
    setExecution_time(300);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    mentored_api.post_new_experiment_definition(selectedFile, exp_name, projectId,
      (response) => {
        if(response.status !== 200 && response.status !== 201){
          toast.error("Error saving experiment definition: " + JSON.stringify(response.data.error), {
            position: toast.POSITION.TOP_CENTER, // Position the toast at the top center
            autoClose: 15000, // Auto close after 5 seconds
            hideProgressBar: false, // Show the progress bar
            closeOnClick: true, // Close on click
            pauseOnHover: true, // Pause the toast on hover
            draggable: true, // Allow toast to be draggable
            progress: undefined,
            // set width
            style: { width: "100%", position: "fixed", left: "25%", textAlign: "center" },
          });

          setIsSubmitting(false);
          return;
        }

        window.location.reload(false);
        setIsSubmitting(false);
      });
  }

  const handleInputChanged = (event) => {
    setExp_name(event.target.value);
  };

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  return (
    <form className="upload col-md-6" onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-4 label">{t('newdefinition.expdescription')}</div>
        <div className="col-md-1 label">
          <input className="file-upload" type="file" onChange={handleFileSelect} />
        </div>
      </div>
      <p className="col-md-12">&nbsp;</p>

      <div className="row">
        <div className="col-md-4 label">{t('newdefinition.experimentname')}</div>
        <div className="col-md-2 ">
          <input
            value={exp_name}
            onChange={handleInputChanged}
            type="text"
            name="exp_name"
            placeholder={t('newdefinition.placeholder')}
            className="action-button"
          />
        </div>
      </div>

      <p className='col-md-12'>&nbsp;</p>

      <div className="col-md-11">
        <button type="submit" className="action-button" disabled={isSubmitting}>
          {t('newdefinition.submit')}
        </button>
        <ToastContainer />
      </div>
    </form>
  );
}

export default NewExperimentDefinition;
