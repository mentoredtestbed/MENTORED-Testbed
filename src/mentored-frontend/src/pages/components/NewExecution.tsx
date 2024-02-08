import React, { useState } from 'react';
import '../../assets/css/NewDefinition.css';
import '../../assets/css/NewExecution.css';
import { useTranslation } from 'react-i18next';
import { AiOutlineCloseSquare } from "react-icons/ai";
import {mentored_api} from "../../utils/useAxios";
import NewExperimentExecution from '../../components/core/NewExperimentExecution';


function NewExecution() {
  const [showPopup, setShowPopup] = useState(false);

  const handleButtonClick = () => {
    setShowPopup(true);
  }

  const handleClosePopup = () => {
    setShowPopup(false);
  }
  const { t } = useTranslation();

  let title = t('newexecution.title')
  let description = t('newexecution.description')
  // (<>
  // </>);

  let tutorial_url = mentored_api.baseURL+"/tutorial/";
  let tutorial_url_display = tutorial_url.replace("https://", "");
  tutorial_url_display = tutorial_url_display.replace("http://", "");
  return (

    <div>
      {showPopup ? (
        <div className="popup-overlay">
          <div className="popup-content ">

            <AiOutlineCloseSquare onClick={handleClosePopup} className="close-button" />

            <div className="background-rectangle-Execution w-95%">
              <h2 className='popup-title-container '>
                {title}
              </h2>
              <p className='popup-text-container '>
                {description}  <a href={tutorial_url}>{tutorial_url_display}</a>
              </p>
            </div>

            <NewExperimentExecution></NewExperimentExecution>
          </div>
        </div>
      ) : null}
      <button onClick={handleButtonClick} className="newrequest-newdefinition-button top-5 h-10vh button-text text-center capitalize">
        {t('newexecution.button1')}
        <br />
        {t('newexecution.button2')}
      </button>
    </div>
  );
}

export default NewExecution;