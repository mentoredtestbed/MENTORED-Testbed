import React from 'react';
import { useTranslation } from 'react-i18next';

import { mentored_api } from "../../utils/useAxios";
import '../../assets/css/NewDefinition.css';
// import 'bootstrap/dist/css/bootstrap.min.css';



const NewExperimentDefinition = () => {

  // a local state to store the currently selected file.
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [exp_name, setExp_name] = React.useState(null);
  const { t } = useTranslation();


  const handleSubmit = async (event) => {
    event.preventDefault();

    mentored_api.post_new_experiment_definition(selectedFile, exp_name,
      (response) => {
        window.location.reload(false);
      });


  }

  const handleInputChanged = (event) => {
    setExp_name(event.target.value);
  }


  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  }

  return (
    <form className='upload col-md-6' onSubmit={handleSubmit}>
      <div className='row'>
        <div className="col-md-4 label">{t('newdefinition.expdescription')}</div>
        <div className="col-md-1 label"><input className='file-upload' type="file" onChange={handleFileSelect} /></div>
      </div>
      <p className='col-md-12'>&nbsp;</p>

      <div className='row'>
        <div className="col-md-4 label">{t('newdefinition.experimentname')}</div>
        <div className="col-md-2 "><input value={exp_name} onChange={handleInputChanged} type="text" name='exp_name' placeholder={t('newdefinition.placeholder')} className="action-button"></input></div>
      </div>

      <p className='col-md-12'>&nbsp;</p>

      <div className="col-md-11"><button type="submit" className="action-button">{t('newdefinition.submit')}</button></div>
    </form>


    // <form className='upload'>
    //   <input type="file" className='file-upload'/>
    //   <button type="submit" className='file-submit'>Upload (YAML format)</button>
    // </form>
  )
};

export default NewExperimentDefinition;