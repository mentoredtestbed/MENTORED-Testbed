import React, { useState } from 'react';
import '../../assets/css/NewDefinition.css';
import '../../assets/css/NewMember.css';
import { useTranslation } from 'react-i18next';
import { AiOutlineCloseSquare } from "react-icons/ai";
import {mentored_api} from "../../utils/useAxios";
import NewExperimentExecution from '../../components/core/NewExperimentExecution';

import {
  TextField,
  Button,
} from '@material-ui/core';

function NewMember({ projectId, projectName }) {
  const [showPopup, setShowPopup] = useState(false);

  const handleButtonClick = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };
  const { t } = useTranslation();

  const title = t('newmember.title');
  const [userEmail, setUserEmail] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('❤️', projectId);
    let member_info = {
      'user_email': userEmail,
      'project_name': projectName,
      'project_id': projectId
    }
    mentored_api.post_invite_member(member_info, (response) => {
      if(response.status == 201){
        window.location.reload(false);
      }else{
        console.log("Erro", response);
      }
    });
    // mentored_api.post_project_member(userEmail, projectId,  (response) => {
    //   window.location.reload(false);
    // });
  };

  const isDisabled = () =>
    !userEmail;


  return (

    <div>
      {showPopup ? (
        <div className="popup-overlay">
          <div className="popup-new-member">
              <div className='popup-title-header'>
                <h2 className='popup-title-container'>
                  {title}
                </h2>
                <AiOutlineCloseSquare onClick={handleClosePopup} className="close-button" />
              </div>
              <div className="background-rectangle-new-member w-100% h-80%">
                <form className="col-md-12 table-background">
                  <div className="formRequestList">
                    <h1 className="col-md-3 formRequestListTitle">
                    {t('newmember.userEmail') as string}
                    </h1>
                    <TextField
                      label={t('newmember.userEmail') as string}
                      fullWidth
                      value={userEmail}
                      InputLabelProps={{
                        style: {
                          display:'none',
                        },
                      }}
                      onChange={(e) => setUserEmail(e.target.value)}
                    />
                  </div>
                  <div className="d-flex justify-content-center top-1vh">
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      className={`buttonPersonalization ${isDisabled() ? 'disabled' : ''}`}
                      disabled={isDisabled()}
                    >
                    {t('newmember.execute') as string}
                    </Button>
                  </div>
                </form>
                
                
              </div>
            </div>
        </div>
      ) : null}
      <button
        onClick={handleButtonClick}
        className="newrequest-newdefinition-button top-5 h-10vh button-text text-center capitalize"
      >
        {t('newexecution.button0')}
        <br />
        {t('newexecution.button3')}
      </button>
    </div>
  );
}

export default NewMember;
