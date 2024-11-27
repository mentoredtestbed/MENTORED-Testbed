import React, { useEffect, useState } from 'react';
import '../../assets/css/NewDefinition.css';
import { useTranslation } from 'react-i18next';
import {mentored_api} from "../../utils/useAxios";
import { AiOutlineCloseSquare } from "react-icons/ai";

import NewExperimentDefinition from '../../components/core/NewExperimentDefinition';
import { FaRegClone } from "react-icons/fa";
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

function NewDefinition({ experiment }) {
  const [showPopup, setShowPopup] = useState(false);
  const [projectList, setProjectList] = useState([]);

  const handleButtonClick = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  }

  useEffect(() => {
    document.addEventListener("keydown", escFunction, false);

    mentored_api.get_projects(setProjectList, (d) => {
      console.log(d);
      setProjectList(d);
    });
  }, []);

  
  const escFunction = (event) => {
    if (event.key === "Escape") {
      handleClosePopup();
    }
  }

  const { t } = useTranslation();

  const title = t('newdefinition.clonePopupTitle') + ": " + experiment.exp_name;
  const description = t('newdefinition.description');

  const handleFormSubmit = () => {
    const clonePageProjectSelect = document.getElementById("clonePageProjectSelect") as HTMLSelectElement;
    const clonePageDefinitionName = document.getElementById("clonePageDefinitionName") as HTMLInputElement;

    const projectId = clonePageProjectSelect.value;
    const name = clonePageDefinitionName.value;
    console.log(projectId, name);
    mentored_api.fork_experiment_definition(experiment.id, projectId, name, (d) => {
      handleClosePopup();
      window.location.reload(false);
    });
  }


  return (
    <div style={{display: 'inline', width: '100%', height: '100%', position: 'relative', margin: '0px'}}>
      {showPopup ? (
        <div className="popup-overlay ">
          <div className="popup-content">
            <div className="popup-header ">
              <div className='popup-title-header'>
                <h5 className='popup-title-container' style={{fontSize: '1.5rem', width: '80%'}}>
                  <br></br>
                  <br></br>
                  {title}
                </h5>
                <AiOutlineCloseSquare onClick={handleClosePopup} className="close-button" />
              </div>
            </div>

            <br></br>

            <div className="container-fluid mt-3vh">
              <div className="row ">
                <div className="col-md-12">
                  {/* <NewExperimentDefinition projectId={projectId}/> */}
                  {/* Form */}
                  <div className="form-group">
                    <label htmlFor="clonePageProjectSelect">{t('newdefinition.selectProject')}</label>
                    <select className="form-control" id="clonePageProjectSelect">
                      {projectList.map((project) => (
                        <option key={project.id} value={project.id}>{project.project_name}</option>
                      ))}
                    </select>

                    <label htmlFor="clonePageDefinitionName">{t('newdefinition.clonePageDefinitionName')}</label>
                    <input type="text" className="form-control" id="clonePageDefinitionName" placeholder={t('newdefinition.clonePageDefinitionNamePlaceholder')} defaultValue={experiment.exp_name + " (Copy)"} />

                    <button type="submit" className="btn btn-primary mt-3vh" onClick={handleFormSubmit}>{t('newdefinition.submitClone')}</button>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

        <div className="clone-button">
          <OverlayTrigger
                  placement="right"
                  delay={{ show: 50, hide: 150 }}
                  overlay={(props) => (
                    <Tooltip id="button-tooltip" {...props}>
                      {t('newdefinition.clone')}
                    </Tooltip>
                  )}
          >
            <div className="clone-button">
              <FaRegClone
                onClick={handleButtonClick}
                className="clone-button"
              />
            </div>
          </OverlayTrigger>
        </div>
    </div>
  );
}

export default NewDefinition;
