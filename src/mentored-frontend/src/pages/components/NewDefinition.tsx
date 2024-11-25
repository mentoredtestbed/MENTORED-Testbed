import React, { useEffect, useState } from 'react';
import '../../assets/css/NewDefinition.css';
import { useTranslation } from 'react-i18next';
import {mentored_api} from "../../utils/useAxios";
import { AiOutlineCloseSquare } from "react-icons/ai";

import NewExperimentDefinition from '../../components/core/NewExperimentDefinition';

function NewDefinition({ projectId }) {
  const [showPopup, setShowPopup] = useState(false);

  const handleButtonClick = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  }

  useEffect(() => {
    document.addEventListener("keydown", escFunction, false);
  }, []);

  
  const escFunction = (event) => {
    if (event.key === "Escape") {
      handleClosePopup();
      // document.removeEventListener("keydown", escFunction, false);
    }
  }

  const { t } = useTranslation();

  const title = t('newdefinition.title');
  const description = t('newdefinition.description');
  // (<>
  //   Here it is possible to create an experiment definition. First, assign a name to this definition and then upload the YAML file with the description. The documentation related to the YAML file format description can be found in <a href="https://portal.mentored.ccsc-research.org/tutorial">portal.mentored.ccsc-research.org/tutorial</a>
  // </>);

  let tutorial_url = mentored_api.baseURL+"/tutorial/";
  let tutorial_url_display = tutorial_url.replace("https://", "");
  tutorial_url_display = tutorial_url_display.replace("http://", "");

  return (
    <div>
      {showPopup ? (
        <div className="popup-overlay ">
          <div className="popup-content">
            <div className="popup-header ">
              <div className='popup-title-header'>
                <h2 className='popup-title-container'>
                  {title}
                </h2>
                <AiOutlineCloseSquare onClick={handleClosePopup} className="close-button" />
              </div>
            </div>

            <div className="container-fluid mt-3vh">
              <div className='popup-header-mode'>
                <button className="popup-page-chooser-container File col-md-2">{t('newdefinition.uploadmode')}</button>
                <button className="popup-page-chooser-container Web col-md-2">{t('newdefinition.webmode')}</button>
              </div>
              <div className="row ">
                <div className="col-md-6">
                  <NewExperimentDefinition projectId={projectId}/>
                </div>
                <div className="background-rectangle-Definition col-md-6">
                  {/* <h3 className='popup-title-container '>
                    {title}
                  </h3> */}
                  <p className='popup-text-container '>
                    {description}  <a href={tutorial_url}>{tutorial_url_display}</a>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <button
        onClick={handleButtonClick}
        className="newrequest-newdefinition-button top-5 h-11vh button-text text-center capitalize"
      >
        {t('newdefinition.upButtonText')}
        <br />
        {t('newdefinition.downButtonText')}
      </button>
    </div>
  );
}

export default NewDefinition;
