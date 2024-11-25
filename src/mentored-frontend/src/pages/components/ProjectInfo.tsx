import React, { useEffect, useState } from 'react';
import '../../assets/css/NewDefinition.css';
import '../../assets/css/experiments.css';
import '../../assets/css/ProjectInfo.css';
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

interface RequestedProjectDetails {
  user_name: string;
  user_email: string;
  user_organization: string;
  id: number;
  project_name: string;
  project_description: string;
  project_identifier: string;
  project_website: string;
  project_visibility: string;
  project_resource_x86: boolean;
  project_resource_arm: boolean;
  project_resource_x86_xlarge: string;
  project_resource_x86_large: string;
  project_resource_x86_small: string;
  project_resource_x86_xsmall: string;
  project_resource_arm_large: string;
  project_resource_arm_small: string;
  project_acceptance: string;
}

function ProjectInfo({ projectInfo }) {
  const [showPopup, setShowPopup] = useState(false);
  const { t } = useTranslation();
  const title = t('newrequest.projectInfo');
  const [projectData, setProjectData] = useState<RequestedProjectDetails | null>(null);

  const handleButtonClick = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  useEffect(() => {
    setProjectData({
      user_name: projectInfo.project_request.user_name,
      user_email: projectInfo.project_request.user_email,
      user_organization: projectInfo.project_request.user_organization,
      id: projectInfo.id,
      project_name: projectInfo.project_request.project_name,
      project_description: projectInfo.project_request.project_description,
      project_identifier: projectInfo.project_request.project_identifier,
      project_website: projectInfo.project_request.project_website,
      project_visibility: projectInfo.project_request.project_visibility,
      project_resource_x86: projectInfo.project_request.project_resource_x86,
      project_resource_arm: projectInfo.project_request.project_resource_arm,
      project_resource_x86_xlarge: projectInfo.project_request.project_resource_x86_xlarge,
      project_resource_x86_large: projectInfo.project_request.project_resource_x86_large,
      project_resource_x86_small: projectInfo.project_request.project_resource_x86_small,
      project_resource_x86_xsmall: projectInfo.project_request.project_resource_x86_xsmall,
      project_resource_arm_large: projectInfo.project_request.project_resource_arm_large,
      project_resource_arm_small: projectInfo.project_request.project_resource_arm_small,
      project_acceptance: projectInfo.project_request.project_acceptance,
    });
  }, []);

  return (

    <div>
      {showPopup ? (
        <div className="popup-overlay">
          <div className="popup-project">
            <div className='popup-title-header'>
              <h2 className='popup-title-container'>
                {title}
              </h2>
              <AiOutlineCloseSquare onClick={handleClosePopup} className="close-button" />
            </div>

              <div className="background-rectangle-Project w-100% h-90%">
                <form className="col-md-12 table-background">
                <div className="formRequestList">
                  <h1 className="col-md-3 formRequestListTitle">
                    {t('newrequest.name') as string}
                  </h1>
                  <TextField
                    label={t('newrequest.nameLabel') as string}
                    fullWidth
                    value={projectData?.user_name}
                    InputLabelProps={{
                      style: {
                        display: projectData?.user_name ? 'none' : 'block',
                      },
                    }}
                    disabled
                  />
                </div>
                <div className="formRequestList">
                  <h1 className="col-md-3 formRequestListTitle">
                    {t('newrequest.email') as string}
                  </h1>
                  <TextField
                    label={t('newrequest.emailLabel') as string}
                    fullWidth
                    value={projectData?.user_email}
                    InputLabelProps={{
                      style: {
                        display: projectData?.user_email ? 'none' : 'block',
                      },
                    }}
                    disabled
                  />
                </div>
                <div className="formRequestList">
                  <h1 className="col-md-3 formRequestListTitle">
                    {t('newrequest.projectName') as string}
                  </h1>
                  <TextField
                    label={t('newrequest.projectNameLabel') as string}
                    fullWidth
                    value={projectData?.project_name}
                    InputLabelProps={{
                      style: {
                        display: projectData?.project_name ? 'none' : 'block',
                      },
                    }}
                    disabled
                  />
                </div>
                <div className="formRequestList">
                  <h1 className="col-md-3 formRequestListTitle">
                    {t('newrequest.projectDescription') as string}
                  </h1>
                  <TextField
                    label={t('newrequest.projectDescriptionLabel') as string}
                    fullWidth
                    multiline
                    rows={4}
                    value={projectData?.project_description}
                    InputLabelProps={{
                      style: {
                        display: projectData?.project_description ? 'none' : 'block',
                      },
                    }}
                    disabled
                  />
                </div>
                <div className="formRequestList">
                  <h1 className="col-md-3 formRequestListTitle">
                    {t('newrequest.projectID') as string}
                  </h1>
                  <TextField
                    label={t('newrequest.projectIDLabel') as string}
                    fullWidth
                    value={projectData?.project_identifier}
                    InputLabelProps={{
                      style: {
                        display: projectData?.project_identifier ? 'none' : 'block',
                      },
                    }}
                    disabled
                  />
                </div>
                <div className="formRequestList">
                  <h1 className="col-md-3 formRequestListTitle">
                    {t('newrequest.projectWebsite') as string}
                  </h1>
                  <TextField
                    label={t('newrequest.projectWebsiteLabel') as string}
                    fullWidth
                    value={projectData?.project_website}
                    InputLabelProps={{
                      style: {
                        display: projectData?.project_website ? 'none' : 'block',
                      },
                    }}
                    disabled
                  />
                </div>
                <div className="formRequestList">
                  <h1 className="col-md-3 formRequestListTitle">
                    {t('newrequest.visibility') as string}
                  </h1>
                  <Select
                    fullWidth
                    defaultValue="Public"
                    value={projectData?.project_visibility}
                    InputLabelProps={{
                      style: {
                        display: projectData?.project_visibility ? 'none' : 'block',
                      },
                    }}
                    disabled
                  >
                    <MenuItem value="Public">
                      {t('newrequest.visibilityPublic') as string}
                    </MenuItem>
                    <MenuItem value="Private">
                    {t('newrequest.visibilityPrivate') as string}
                    </MenuItem>
                    <MenuItem value="Protected">
                    {t('newrequest.visibilityProtected') as string}
                    </MenuItem>
                  </Select>
                </div>
                </form>
              </div>
            </div>
        </div>
      ) : ( <SlEye onClick={handleButtonClick} className="table-icons"/>)}
    </div>
  );
}

export default ProjectInfo;
