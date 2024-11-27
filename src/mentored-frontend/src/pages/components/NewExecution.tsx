import React, { useEffect, useState } from 'react';
import '../../assets/css/NewDefinition.css';
import '../../assets/css/NewExecution.css';
import { useTranslation } from 'react-i18next';
import { AiOutlineCloseSquare } from "react-icons/ai";
import {mentored_api} from "../../utils/useAxios";
import NewExperimentExecution from '../../components/core/NewExperimentExecution';

function NewExecution({ projectId, experimentId }) {
  const [showPopup, setShowPopup] = useState(false);

  const handleButtonClick = () => {
    localStorage.setItem('isNewExperimentExecutionOpen', "true");
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    localStorage.setItem('isNewExperimentExecutionOpen', "");
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

  const title = t('newexecution.title');
  const description = t('newexecution.description');
  // (<>
  // </>);

  let tutorial_url = mentored_api.baseURL+"/tutorial/";
  let tutorial_url_display = tutorial_url.replace("https://", "");
  tutorial_url_display = tutorial_url_display.replace("http://", "");
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
                {description}  <a href={tutorial_url}>{tutorial_url_display}</a>
              </p>
            </div>

            <NewExperimentExecution projectId={projectId} experimentId={experimentId}/>
          </div>
        </div>
      ) : null}
      <button
        onClick={handleButtonClick}
        className="title-option newrequest-newdefinition-button top-5 h-10vh button-text text-center capitalize"
      >
        {t('newexecution.upButtonText')}
        <br />
        {t('newexecution.downButtonText')}
      </button>
    </div>
  );
}

export default NewExecution;
