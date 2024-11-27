import React, { useEffect, useState } from 'react';
import '../../assets/css/NewDefinition.css';
import { useTranslation } from 'react-i18next';
import { CgCloseR } from 'react-icons/cg';

import '../../assets/css/tabela.css';
import '../../assets/css/experiments.css';

import { mentored_api } from '../../utils/useAxios';

import {
  TextField,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  Link,
  Button,
} from '@material-ui/core';

function NewRequestForm({ onRequestClose }: { onRequestClose: () => void }) {
  const { t, i18n } = useTranslation();
  const [showX86, setShowX86] = useState(false);
  const [showARM, setShowARM] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectID, setProjectID] = useState('');
  const [projectWebsite, setProjectWebsite] = useState('');
  const [projectVisibility, setVisibility] = useState('Public');
  const [xLargeX86, setXLargeX86] = useState('');
  const [largeX86, setLargeX86] = useState('');
  const [smallX86, setSmallX86] = useState('');
  const [xSmallX86, setXSmallX86] = useState('');
  const [armLarge, setArmLarge] = useState('');
  const [armSmall, setArmSmall] = useState('');

  const [checkingProjectNameAvailable, setCheckingProjectNameAvailable] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let login_data = JSON.parse(localStorage.getItem('login_data') || '');
    setName(login_data?.user?.first_name + ' ' + login_data?.user?.last_name);
    setEmail(login_data?.user?.email);
    setOrganization(login_data?.user?.organization);
    console.log("USER", login_data?.user?.first_name + ' ' + login_data?.user?.last_name);
    console.log("USER", login_data?.user?.email);
    console.log("USER", login_data?.user?.organization);
  }, []);

  const data = {
    name,
    email,
    organization,
    projectName,
    projectDescription,
    projectID,
    projectWebsite,
    projectVisibility,
    showX86,
    xLargeX86,
    largeX86,
    smallX86,
    xSmallX86,
    showARM,
    armLarge,
    armSmall,
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if(!error){
      console.log('❤️', data);
      mentored_api.post_new_project_request(data, (response) => {
        window.location.reload(false);
      });
    }
  };

  const isDisabled = () =>
    !name ||
    !email ||
    !organization ||
    !projectName ||
    !projectDescription ||
    !projectID ||
    !projectVisibility ||
    (!showX86 && !showARM) || error;

  const handleCloseForm = () => {
    onRequestClose();
  };

  const checkProjectName = async (name: String) => {
    if(name) {
      setCheckingProjectNameAvailable(true);
      try {
        mentored_api.check_project_name(name, () => {}, (response) => {
          if (response.exists) {
            setError(t('newrequest.projectNameError'));
          } else {
            setError('');
          }
        });
      } catch (err) {
        console.error('Error checking project name:', err);
        setError(t('newrequest.projectNameError_2'));
      } finally {
        setCheckingProjectNameAvailable(false);
      }
    }else{ 
      setCheckingProjectNameAvailable(false);
      setError('');
    }
  };

  const handleProjectNameChange = (e) => {
    const name = e.target.value;
    setProjectName(name);

    // Format the project identifier
    const formattedIdentifier = name
        .trim()  // Remove leading and trailing whitespace
        .replace(/\s+/g, '-')  // Replace spaces with hyphens
        .toLowerCase();  // Convert to lowercase

    setProjectID(formattedIdentifier);
  };

  useEffect(() => {
    if (projectName) {
        checkProjectName(projectName);
    }
  }, [i18n.language, projectName]);

  return (
    <div className="container-fluid top-10" style={{ width: '100%', height: '100%' }}>
      <div className="col-md-13">
        <div className="header-table d-inline-flex p-2 justify-content-between col-md-12">
          <h1 className="title-table ">{t('newrequest.requestForm') as string}</h1>
          <CgCloseR onClick={handleCloseForm} className=" table-icons color-white" />
        </div>
        <div className="table-container" style={{ maxHeight: '70vh', overflow: 'auto' }}>
          <div className="header-table-fixed " style={{ padding: '2vh' }}>
            <form className="col-md-12 table-background">
              <div className="formRequestList">
                <h1 className="col-md-3 formRequestListTitle">
                  {t('newrequest.name') as string}
                </h1>
                <TextField
                  label={t('newrequest.nameLabel') as string}
                  fullWidth
                  value={name}
                  InputLabelProps={{
                    style: {
                      display: name ? 'none' : 'block',
                    },
                  }}
                  disabled
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="formRequestList">
                <h1 className="col-md-3 formRequestListTitle">
                  {t('newrequest.email') as string}
                </h1>
                <TextField
                  label={t('newrequest.emailLabel') as string}
                  fullWidth
                  value={email}
                  InputLabelProps={{
                    style: {
                      display: email ? 'none' : 'block',
                    },
                  }}
                  disabled
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="formRequestList">
                <h1 className="col-md-3 formRequestListTitle">
                  {t('newrequest.organization') as string}
                </h1>
                <TextField
                  label={t('newrequest.organizationLabel') as string}
                  fullWidth
                  value={organization}
                  InputLabelProps={{
                    style: {
                      display: organization ? 'none' : 'block',
                    },
                  }}
                  disabled
                  onChange={(e) => setOrganization(e.target.value)}
                />
              </div>
              <div className="formRequestList">
                <h1 className="col-md-3 formRequestListTitle">
                  {t('newrequest.projectName') as string}
                </h1>
                <TextField
                  label={t('newrequest.projectNameLabel') as string}
                  fullWidth
                  value={projectName}
                  InputLabelProps={{
                    style: {
                      display: projectName ? 'none' : 'block',
                    },
                  }}
                  onChange={handleProjectNameChange}
                  onBlur={() => checkProjectName(projectName)}
                  error={Boolean(error)}
                  helperText={error}
                  disabled={checkingProjectNameAvailable} 
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
                  value={projectDescription}
                  InputLabelProps={{
                    style: {
                      display: projectDescription ? 'none' : 'block',
                    },
                  }}
                  onChange={(e) => setProjectDescription(e.target.value)}
                />
              </div>
              <div className="formRequestList">
                <h1 className="col-md-3 formRequestListTitle">
                  {t('newrequest.projectID') as string}
                </h1>
                <TextField
                  label={t('newrequest.projectIDLabel') as string}
                  fullWidth
                  value={projectID}
                  InputLabelProps={{
                    style: {
                      display: projectID ? 'none' : 'block',
                    },
                  }}
                  onChange={(e) => setProjectID(e.target.value)}
                />
              </div>
              <div className="formRequestList">
                <h1 className="col-md-3 formRequestListTitle">
                  {t('newrequest.projectWebsite') as string}
                </h1>
                <TextField
                  label={t('newrequest.projectWebsiteLabel') as string}
                  fullWidth
                  value={projectWebsite}
                  InputLabelProps={{
                    style: {
                      display: projectWebsite ? 'none' : 'block',
                    },
                  }}
                  onChange={(e) => setProjectWebsite(e.target.value)}
                />
              </div>
              <div className="formRequestList">
                <h1 className="col-md-3 formRequestListTitle">
                  {t('newrequest.visibility') as string}
                </h1>
                <Select
                  fullWidth
                  defaultValue="Public"
                  value={projectVisibility}
                  InputLabelProps={{
                    style: {
                      display: projectVisibility ? 'none' : 'block',
                    },
                  }}
                  onChange={(e) => setVisibility(e.target.value as string)}
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
                <Link href="/requests">{t('newrequest.whatIsIt')}</Link>
              </h1>

              <div className="formRequestList col-md-3">
                <FormControlLabel
                  control={<Checkbox onChange={() => setShowX86(!showX86)} />}
                  label="X86"
                />
                <FormControlLabel
                  control={<Checkbox onChange={() => setShowARM(!showARM)} />}
                  label="ARM"
                />
              </div>
              {(showX86 || showARM) && (
                <h1 className="col-md-3 formRequestListTitle">
                  {t('newrequest.numberOfPods') as string}
                </h1>
              )}
              {showX86 && (
                <>
                  <div className="formRequestList">
                    <h1 className="col-md-3 formRequestListTitle">
                      {t('newrequest.xLargeX86') as string}
                    </h1>
                    <TextField
                      label={t('newrequest.xLargeX86') as string}
                      fullWidth
                      value={xLargeX86}
                      InputLabelProps={{
                        style: {
                          display: xLargeX86 ? 'none' : 'block',
                        },
                      }}
                      onChange={(e) => setXLargeX86(e.target.value)}
                    />
                  </div>
                  <div className="formRequestList">
                    <h1 className="col-md-3 formRequestListTitle">
                      {t('newrequest.largeX86') as string}
                    </h1>
                    <TextField
                      label={t('newrequest.largeX86') as string}
                      fullWidth
                      value={largeX86}
                      InputLabelProps={{
                        style: {
                          display: largeX86 ? 'none' : 'block',
                        },
                      }}
                      onChange={(e) => setLargeX86(e.target.value)}
                    />
                  </div>
                  <div className="formRequestList">
                    <h1 className="col-md-3 formRequestListTitle">
                      {t('newrequest.smallX86') as string}
                    </h1>
                    <TextField
                      label={t('newrequest.smallX86') as string}
                      fullWidth
                      value={smallX86}
                      InputLabelProps={{
                        style: {
                          display: smallX86 ? 'none' : 'block',
                        },
                      }}
                      onChange={(e) => setSmallX86(e.target.value)}
                    />
                  </div>
                  <div className="formRequestList">
                    <h1 className="col-md-3 formRequestListTitle">
                      {t('newrequest.xSmallX86') as string}
                    </h1>
                    <TextField
                      label={t('newrequest.xSmallX86') as string}
                      fullWidth
                      value={xSmallX86}
                      InputLabelProps={{
                        style: {
                          display: xSmallX86 ? 'none' : 'block',
                        },
                      }}
                      onChange={(e) => setXSmallX86(e.target.value)}
                    />
                  </div>
                </>
              )}
              {showARM && (
                <>
                  <div className="formRequestList">
                    <h1 className="col-md-3 formRequestListTitle">
                      {t('newrequest.armLarge') as string}
                    </h1>
                    <TextField
                      label={t('newrequest.armLarge') as string}
                      fullWidth
                      value={armLarge}
                      InputLabelProps={{
                        style: {
                          display: armLarge ? 'none' : 'block',
                        },
                      }}
                      onChange={(e) => setArmLarge(e.target.value)}
                    />
                  </div>
                  <div className="formRequestList">
                    <h1 className="col-md-3 formRequestListTitle">
                      {t('newrequest.armSmall') as string}
                    </h1>
                    <TextField
                      label={t('newrequest.armSmall') as string}
                      fullWidth
                      value={armSmall}
                      InputLabelProps={{
                        style: {
                          display: armSmall ? 'none' : 'block',
                        },
                      }}
                      onChange={(e) => setArmSmall(e.target.value)}
                    />
                  </div>
                </>
              )}
              <div className="d-flex justify-content-center top-1vh">
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  className={`buttonPersonalization ${isDisabled() ? 'disabled' : ''}`}
                  disabled={isDisabled()}
                >
                  {t('newrequest.send') as string}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewRequestForm;
