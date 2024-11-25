import React, { useEffect, useState } from 'react';
import '../../assets/css/NewDefinition.css';
import { useTranslation } from 'react-i18next';
import { CgCloseR } from 'react-icons/cg';

import '../../assets/css/tabela.css';
import '../../assets/css/experiments.css';

import { mentored_api } from '../../utils/useAxios';
import useAxios from '../../utils/useAxios';

import Loading from './Loading';

import {
  TextField,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  Link,
  Button,
  CircularProgress,
} from '@material-ui/core';

interface RequestedProjectDetailsProps {
  name: string;
  user: string;
  onRequestClose: () => void;
  project_id: number;
}

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
  project_id: number;
  project_request_subject: string;
  current_project_status: string;
  project_admin_response: string;
  project_acceptance: string;
}

function RequestedProjectDetails({
  name,
  user,
  onRequestClose,
  project_id
}: RequestedProjectDetailsProps) {
  const { t } = useTranslation();

  const [projectData, setProjectData] = useState<RequestedProjectDetails | null>(null);
  const [loading, setLoading] = useState(true); // Adicione este estado
  const api = useAxios();

  const [showX86, setShowX86] = useState(false);
  const [showARM, setShowARM] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [projectAdminResponse, setProjectAdminResponse] = useState('');
  const [previousProjectAdminResponse, setPreviousProjectAdminResponse] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/get_login_data/');
        let isAdmin = response?.data?.user?.is_admin;
        setIsAdmin(isAdmin || false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
    setTimeout(() => {
      get_project_details((data) => {
          if (data) {
              console.log("testtt", data);
              setProjectData({
                user_name: data.user_name,
                user_email: data.user_email,
                user_organization: data.user_organization,
                id: data.id,
                project_name: data.project_name,
                project_description: data.project_description,
                project_identifier: data.project_identifier,
                project_website: data.project_website,
                project_visibility: data.project_visibility,
                project_resource_x86: data.project_resource_x86,
                project_resource_arm: data.project_resource_arm,
                project_resource_x86_xlarge: data.project_resource_x86_xlarge,
                project_resource_x86_large: data.project_resource_x86_large,
                project_resource_x86_small: data.project_resource_x86_small,
                project_resource_x86_xsmall: data.project_resource_x86_xsmall,
                project_resource_arm_large: data.project_resource_arm_large,
                project_resource_arm_small: data.project_resource_arm_small,
                project_id: data.project_id,
                project_request_subject: data.project_request_subject,
                current_project_status: data.current_project_status,
                project_admin_response: data?.project_admin_response,
                project_acceptance: data.project_acceptance,
              });
              setProjectAdminResponse(data?.project_admin_response);
              setPreviousProjectAdminResponse(data?.project_admin_response);
          } else {
              console.log('Failed to fetch project details');
          }
      });
      setLoading(false);
    }, 2000);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    console.log("Admin", isAdmin);
  }, [isAdmin])

  const isDisabled = () => {
    if(projectData?.project_acceptance == "Idle"){
      return false;
    }
    return true;
  }

  const get_project_details = (cb) => {
      mentored_api.get_requested_project(project_id, (d) => {
        cb(d);
      });
  };

  const handleCloseForm = () => {
    onRequestClose();
  };

  const checkIsChanged = () => {
    return !(previousProjectAdminResponse == projectAdminResponse);
  }

  const handleProjectRequestAccepted = (event: React.FormEvent) => {
    event.preventDefault();
    let project_request_data = { ...projectData, project_acceptance: 'Accepted' };
    console.log(project_request_data);
    try {
      // Post new project and wait for it to complete
      mentored_api.post_new_project(project_request_data, (response) => {
        if(response.status == 201){ //created
          mentored_api.edit_project_acceptance(project_request_data, (editResponse) => {
            if(editResponse.status == 200){ // Ok
              window.location.reload(false);
            }else {
              console.error("Error editing project acceptance:", editResponse);
            }
          });
        }else {
          console.error("Error posting new project:", response);
        }
      });
    }catch(error){
      console.error("Error processing project request:", error);
    }
  }

  const handleProjectRequestRejected = (event: React.FormEvent) => {
    event.preventDefault();
    let project_request_data = { ...projectData, project_acceptance: 'Rejected' };
    console.log(project_request_data);
    mentored_api.edit_project_acceptance(project_request_data, (response) => {
      if(response.status == 200){
        window.location.reload(false);
      }
    });
  }

  const handleAdminResponse = (event: React.FormEvent) => {
    event.preventDefault();
    mentored_api.edit_admin_response(projectData, projectAdminResponse, (response) => {
      if(response.status == 200){
        console.log('projectAdminResponse', projectAdminResponse);
        setPreviousProjectAdminResponse(projectAdminResponse);
      }
    });
  }

  const handleProjectStatus = (event: React.FormEvent) => {
    event.preventDefault();
    let project_is_active = projectData?.project_request_subject == 'Deactivation' ? false : true;
    let project_request_data = { ...projectData, current_project_status: projectData?.project_request_subject == 'Deactivation' ? 'Deactivated' : 'Activated'};
    mentored_api.edit_project_is_active(project_is_active, projectData?.project_id, (response) => {
      if(response.status == 200){
        mentored_api.edit_current_project_request_status(project_request_data, (response_current) => {
          if(response_current.status == 200){
            window.location.reload(false);
          }  
        });
      }
    });
  }

  const handleProjectStatusButton = () => {
    if((projectData?.current_project_status == 'Deactivated' && projectData.project_request_subject == 'Deactivation') || (projectData?.current_project_status == 'Activated' && projectData.project_request_subject == 'Activation')){
      return true;
    }
    return false;
  }

  if(loading){
    return <Loading insideTable={false}/>;
    // return (
    //   <div className="table-container col-md-12">
    //       <div
    //       style={{
    //           display: 'flex',
    //           justifyContent: 'center',
    //           alignItems: 'center',
    //           height: '100vh',
    //       }}
    //       >
    //       <CircularProgress />
    //       </div>
    //   </div>
    // )
  }

  return (
    projectData && (
      <div className="container-fluid top-10" style={{ width: '100%', height: '100%' }}>
        <div className="col-md-13">
          <div className="header-table d-inline-flex p-2 justify-content-between col-md-12">
            <h1 className="title-table ">{t('newrequest.requestForm') as string}</h1>
            <CgCloseR onClick={handleCloseForm} className=" table-icons color-white" />
          </div>
          <div
            className="table-container"
            style={{ maxHeight: '70vh', overflow: 'auto' }}
          >
            <div className="header-table-fixed " style={{ padding: '2vh' }}>
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
                    {t('newrequest.organization') as string}
                  </h1>
                  <TextField
                    label={t('newrequest.organizationLabel') as string}
                    fullWidth
                    value={projectData?.user_organization}
                    InputLabelProps={{
                      style: {
                        display: projectData?.user_organization ? 'none' : 'block',
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
                <h1 className="col-md-3 formRequestListTitle">
                  {t('newrequest.projectResources') as string}:{' '}
                  <Link href="/requests">What is it?</Link>
                </h1>
                <div className="formRequestList col-md-3">
                  <FormControlLabel
                    control={<Checkbox checked={projectData.project_resource_x86} onChange={() => setShowX86(projectData.project_resource_x86)} />}
                    label="X86"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={projectData.project_resource_arm} onChange={() => setShowARM(projectData.project_resource_arm)} />}
                    label="ARM"
                  />
                </div>
                {(projectData.project_resource_arm || projectData.project_resource_x86) &&  
                <h1 className="col-md-3 formRequestListTitle">
                  {t('newrequest.numberOfPods') as string}
                </h1>
                }
                {projectData.project_resource_x86 && 
                <>
                  <div className="formRequestList">
                    <h1 className="col-md-3 formRequestListTitle">
                      {t('newrequest.xLargeX86') as string}
                    </h1>
                    <TextField
                      label={t('newrequest.xLargeX86') as string}
                      fullWidth
                      value={projectData?.project_resource_x86_xlarge}
                      InputLabelProps={{
                        style: {
                          display: projectData?.project_resource_x86_xlarge ? 'none' : 'block',
                        },
                      }}
                      disabled
                    />
                  </div>
                  <div className="formRequestList">
                    <h1 className="col-md-3 formRequestListTitle">
                      {t('newrequest.largeX86') as string}
                    </h1>
                    <TextField
                      label={t('newrequest.largeX86') as string}
                      fullWidth
                      value={projectData?.project_resource_x86_large}
                      InputLabelProps={{
                        style: {
                          display: projectData?.project_resource_x86_large ? 'none' : 'block',
                        },
                      }}
                      disabled
                    />
                  </div>
                  <div className="formRequestList">
                    <h1 className="col-md-3 formRequestListTitle">
                      {t('newrequest.smallX86') as string}
                    </h1>
                    <TextField
                      label={t('newrequest.smallX86') as string}
                      fullWidth
                      value={projectData?.project_resource_x86_small}
                      InputLabelProps={{
                        style: {
                          display: projectData?.project_resource_x86_small ? 'none' : 'block',
                        },
                      }}
                      disabled
                    />
                  </div>
                  <div className="formRequestList">
                    <h1 className="col-md-3 formRequestListTitle">
                      {t('newrequest.xSmallX86') as string}
                    </h1>
                    <TextField
                      label={t('newrequest.xSmallX86') as string}
                      fullWidth
                      value={projectData?.project_resource_x86_xsmall}
                      InputLabelProps={{
                        style: {
                          display: projectData?.project_resource_x86_xsmall ? 'none' : 'block',
                        },
                      }}
                      disabled
                    />
                  </div>
                </>
                }
                {projectData.project_resource_arm && 
                <>
                  <div className="formRequestList">
                    <h1 className="col-md-3 formRequestListTitle">
                      {t('newrequest.armLarge') as string}
                    </h1>
                    <TextField
                      label={t('newrequest.armLarge') as string}
                      fullWidth
                      value={projectData?.project_resource_arm_large}
                      InputLabelProps={{
                        style: {
                          display: projectData?.project_resource_arm_large ? 'none' : 'block',
                        },
                      }}
                      disabled
                    />
                  </div>
                  <div className="formRequestList">
                    <h1 className="col-md-3 formRequestListTitle">
                      {t('newrequest.armSmall') as string}
                    </h1>
                    <TextField
                      label={t('newrequest.armSmall') as string}
                      fullWidth
                      value={projectData?.project_resource_arm_small}
                      InputLabelProps={{
                        style: {
                          display: projectData?.project_resource_arm_small ? 'none' : 'block',
                        },
                      }}
                      disabled
                    />
                  </div>
                  </>
                  }
                  {!isAdmin && projectData.project_acceptance == 'Idle' ? null :
                    <div className="formRequestList">
                      <h1 className="col-md-3 formRequestListTitle">
                        {t('newrequest.projectAdminResponse') as string}
                      </h1>
                      <TextField
                        label={t('newrequest.projectAdminResponseLabel') as string}
                        fullWidth
                        multiline
                        rows={4}
                        value={projectAdminResponse}
                        InputLabelProps={{
                          style: {
                            display: projectAdminResponse ? 'none' : 'block',
                          },
                        }}
                        disabled={!isAdmin}
                        onChange={(e) => {setProjectAdminResponse(e.target.value)}}
                      />
                    </div>
                  }
                  {isAdmin && 
                    <div className="d-flex justify-content-around top-1vh">
                    {projectData.project_request_subject != "Creation" ?
                      <>
                      <Button
                        variant="contained"
                        onClick={handleProjectStatus}
                        className={`buttonPersonalizationRequest ${handleProjectStatusButton() ? 'disabled' : ''}`}
                        style={{ backgroundColor: handleProjectStatusButton() ? 'grey' : "#103559" }}
                        disabled={handleProjectStatusButton()}
                      >
                        {projectData.project_request_subject == "Deactivation" ?
                          t('newrequest.deactivate') as string
                        :
                          t('newrequest.activate') as string
                        }
                      </Button>
                      {checkIsChanged() && 
                        <Button
                        variant="contained"
                        onClick={handleAdminResponse}
                        className={`buttonPersonalizationRequest`}
                        style={{ backgroundColor: "#103559" }}
                        >
                          {t('newrequest.save') as string} 
                        </Button>
                      }
                      </>
                    :
                      <>
                      <Button
                        variant="contained"
                        onClick={handleProjectRequestAccepted}
                        className={`buttonPersonalizationRequest ${isDisabled() ? 'disabled' : ''}`}
                        disabled={isDisabled()}
                        style={{ backgroundColor: projectData.project_acceptance == "Idle" ? "#103559" : projectData.project_acceptance == "Accepted" ? 'green' : 'grey' }}
                      >
                        {(projectData.project_acceptance == 'Accepted' || projectData.project_acceptance == 'Rejected') ? 
                          t('newrequest.accepted') as string
                          :
                          t('newrequest.accept') as string
                        }
                        
                      </Button>
                      {checkIsChanged() && 
                        <Button
                        variant="contained"
                        onClick={handleAdminResponse}
                        className={`buttonPersonalizationRequest`}
                        style={{ backgroundColor: "#103559" }}
                        >
                          {t('newrequest.save') as string} 
                        </Button>
                      }
                      <Button
                        variant="contained"
                        onClick={handleProjectRequestRejected}
                        className={`buttonPersonalizationRequest ${isDisabled() ? 'disabled' : ''}`}
                        disabled={isDisabled()}
                        style={{ backgroundColor: projectData.project_acceptance == "Idle" ? "#103559" : projectData.project_acceptance == "Rejected" ? 'red' : 'grey' }}
                      >
                        {(projectData.project_acceptance == 'Rejected' || projectData.project_acceptance == 'Accepted') ? 
                          t('newrequest.rejected') as string
                          :
                          t('newrequest.reject') as string
                        }
                      </Button>
                      </>
                    }
                    </div>
                  }
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  );
}

export default RequestedProjectDetails;
