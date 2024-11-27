import React, { useEffect, useState } from 'react';
import '../../assets/css/NewDefinition.css';
import '../../assets/css/experiments.css';
import '../../assets/css/MemberInfo.css';
import { useTranslation } from 'react-i18next';
import { AiOutlineCloseSquare } from "react-icons/ai";
import {mentored_api} from "../../utils/useAxios";
import NewExperimentExecution from '../../components/core/NewExperimentExecution';
import { TiDeleteOutline, TiPencil } from 'react-icons/ti';

import {
  TextField,
  Select,
  MenuItem,
  Button,
} from '@material-ui/core';
import { SlEye } from 'react-icons/sl';

function MemberInfo({ userInfo, viewOnly, projectId }) {
  const [showPopup, setShowPopup] = useState(false);
  const { t } = useTranslation();
  const title = t('memberinfo.title');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [originalUserName, setOriginalUserName] = useState('');
  const [originalUserEmail, setOriginalUserEmail] = useState('');
  const [originalUserRole, setOriginalUserRole] = useState('');
  const isDisabled = () => {
    if(originalUserRole == userRole){
      return true
    }
    return false
  }

  const handleButtonClick = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    resetToOriginalValues();
    setShowPopup(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Sending user role: ", userRole, userEmail);
    mentored_api.edit_project_user_role(userRole, projectId, userEmail, (response) => {
      if(response){
        window.location.reload(false);
      }
    });
  };

  useEffect(() => {
    setUserName(userInfo.external_data.Given + ' ' + userInfo.external_data.Family);
    setUserEmail(userInfo.email);
    setUserRole(userInfo.external_data.UserRole);
    setOriginalUserName(userInfo.external_data.Given + ' ' + userInfo.external_data.Family);
    setOriginalUserEmail(userInfo.email);
    setOriginalUserRole(userInfo.external_data.UserRole);
  }, [])

  const resetToOriginalValues = () => {
    setUserName(originalUserName);
    setUserEmail(originalUserEmail);
    setUserRole(originalUserRole);
  };

  return (

    <div>
      {showPopup ? (
        <div className="popup-overlay">
          <div className="popup-member">
              <div className='popup-title-header'>
                <h2 className='popup-title-container'>
                  {title}
                </h2>
                <AiOutlineCloseSquare onClick={handleClosePopup} className="close-button" />
              </div>

              <div className="background-rectangle-Member w-100% h-80%">
                <form className="col-md-12 table-background">
                  <div className="formRequestList">
                    <h1 className="col-md-3 formRequestListTitle">
                    {t('memberinfo.userName') as string}
                    </h1>
                    <TextField
                      label={t('memberinfo.userName') as string}
                      fullWidth
                      value={userName}
                      InputLabelProps={{
                        style: {
                          display:'none',
                        },
                      }}
                      onChange={(e) => setUserName(e.target.value)}
                      disabled
                    />
                  </div>
                  <div className="formRequestList">
                    <h1 className="col-md-3 formRequestListTitle">
                    {t('memberinfo.userEmail') as string}
                    </h1>
                    <TextField
                      label={t('memberinfo.userEmail') as string}
                      fullWidth
                      value={userEmail}
                      InputLabelProps={{
                        style: {
                          display:'none',
                        },
                      }}
                      onChange={(e) => setUserEmail(e.target.value)}
                      disabled
                    />
                  </div>
                  <div className="formRequestList">
                    <h1 className="col-md-3 formRequestListTitle">
                    {t('memberinfo.userRole') as string}
                    </h1>
                      <Select
                        fullWidth
                        defaultValue="Experimenter"
                        value={userRole}
                        InputLabelProps={{
                          style: {
                            display: userRole ? 'none' : 'block',
                          },
                        }}
                        disabled={viewOnly}
                        onChange={(e) => setUserRole(e.target.value as string)}
                      >
                        {viewOnly && 
                          <MenuItem value="Project Leader" disabled>
                            {t('memberinfo.roleOne') as string}
                          </MenuItem>
                        }
                        <MenuItem value="Project Manager">
                          {t('memberinfo.roleTwo') as string}
                        </MenuItem>
                        <MenuItem value="Experimenter">
                          {t('memberinfo.roleThree') as string}
                        </MenuItem>
                      </Select>
                  </div>
                </form>
                {!viewOnly && 
                  <div className="d-flex justify-content-center top-1vh">
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      className={`buttonPersonalization ${isDisabled() ? 'disabled' : ''}`}
                      disabled={isDisabled()}
                    >
                    {t('memberinfo.save') as string}
                    </Button>
                  </div>
                }
              </div>
            </div>
        </div>
      ) : (viewOnly ? <SlEye onClick={handleButtonClick} className="table-icons"/> : <TiPencil className="table-icons" onClick={handleButtonClick} />)}
    </div>
  );
}

export default MemberInfo;
