import React, { useState } from 'react';
import '../../assets/css/NewDefinition.css';
import { AiOutlineCloseSquare } from "react-icons/ai";
import { useTranslation } from 'react-i18next';

import NewExperimentDefinition from '../../components/core/NewExperimentDefinition';


function NewDefinition() {
  const [showPopup, setShowPopup] = useState(false);

  const handleButtonClick = () => {
    setShowPopup(true);
  }

  const handleClosePopup = () => {
    setShowPopup(false);
  }
  const { t } = useTranslation();

  let title = t('newdefinition.title')
  let description = t('newdefinition.description')
  // (<>
  //   Here it is possible to create an experiment definition. First, assign a name to this definition and then upload the YAML file with the description. The documentation related to the YAML file format description can be found in <a href="https://mentored-testbed.cafeexpresso.rnp.br/tutorial">mentored-testbed.cafeexpresso.rnp.br/tutorial</a>
  // </>);

  return (
    <div>
      {showPopup ? (
        <div className="popup-overlay " >
          <div className="popup-content">

            <div className="popup-header ">
              <button className="popup-page-chooser-container File col-md-2">{t('newdefinition.uploadmode')}</button>
              <button className="popup-page-chooser-container Web col-md-2">{t('newdefinition.webmode')}</button>
              <AiOutlineCloseSquare onClick={handleClosePopup} className="close-button ml-70vw " />
            </div>

            <div className="container-fluid mt-3vh">
              <div className="row ">
                <div className="col-md-6">
                  <NewExperimentDefinition></NewExperimentDefinition>
                </div>
                <div className="background-rectangle-Definition col-md-6">
                  <h2 className='popup-title-container '>
                    {title}
                  </h2>
                  <p className='popup-text-container '>
                    {description}  <a href="https://mentored-testbed.cafeexpresso.rnp.br/tutorial">mentored-testbed.cafeexpresso.rnp.br/tutorial</a>.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div >
      ) : null
      }
      <button onClick={handleButtonClick} className="newrequest-newdefinition-button top-5 h-11vh button-text text-center capitalize">
        {t('newdefinition.button1')}
        <br />
        {t('newdefinition.button2')}
      </button>
    </div >
  );
}

export default NewDefinition;