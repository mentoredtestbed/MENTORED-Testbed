import React, { useEffect, createRef, RefObject } from 'react';

import '../../assets/css/NewDefinition.css';
import '../../assets/css/NewExecution.css';
import { oneDark } from '@codemirror/theme-one-dark';

import '../../assets/css/tabela.css';

import { AiOutlineCloseSquare } from 'react-icons/ai';
import { BsSearch } from 'react-icons/bs';
import { ImDisplay } from 'react-icons/im';
import { SlEye } from 'react-icons/sl';
import { TiPencil, TiDeleteOutline } from 'react-icons/ti';
import { FaRegSave, FaRegEdit, FaFileDownload } from "react-icons/fa";
import {mentored_api} from "../../utils/useAxios";

import YamlEditor from '@focus-reactive/react-yaml';

import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/yaml/yaml';

import data from '../../../public/dados.json'; // im
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { withTranslation, WithTranslation } from 'react-i18next';
import PopUp from '../../pages/components/CloneDefinition';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the styles for the toast


interface Props extends WithTranslation {
  exp: any;
  viewOnlyMode: boolean;
  iconAsTitle: boolean;
  onSaveCallback?: (yaml: string) => void;
}

interface State {
  showPopup: any;
  showClonePopup: boolean;
  isTextChanged: boolean;
}

const { useState, useRef, useLayoutEffect } = React;

class ExperimentDefinitionYAMLView extends React.Component<Props, State> {

  title = 'Experiment Definition (YAML)';
  description = ''
  initialText = ''
  yamlEditor : any = null
  editedText = ''
  editorRef: RefObject<HTMLDivElement>;

  constructor(props) {
    super(props);
    this.state = {
      showPopup: false,
      isTextChanged: false,
      showClonePopup: false,
    };
    this.editorRef = createRef<HTMLDivElement>();
    this.title = "Experiment "+this.props.exp.id + " - "+this.props.exp.exp_name; 
    this.initialText = this.props.exp.display_experiment_yaml_file;
    this.editedText = this.initialText;
    this.handleChangeYAML = this.handleChangeYAML.bind(this); // Add this line
  }
  
  componentDidMount(){
    this.escFunction = this.escFunction.bind(this);
    this.ctrlSFunction = this.ctrlSFunction.bind(this);
    document.addEventListener("keydown", this.escFunction, false);
    if (!this.props.viewOnlyMode){
      document.addEventListener("keydown", this.ctrlSFunction, false);
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.showPopup !== this.state.showPopup) {
      const editor = this.editorRef.current;
      if (this.props.viewOnlyMode && editor) {
        editor.addEventListener('keydown', this.preventKeyboardInput);
      }
    }
  }

  componentWillUnmount(){
    document.removeEventListener("keydown", this.escFunction, false);
    const editor = this.editorRef.current;
    if (this.props.viewOnlyMode && editor) {
      editor.removeEventListener('keydown', this.preventKeyboardInput);
    }
  }

  preventKeyboardInput = (event: KeyboardEvent) => {
    const isCtrlC = event.ctrlKey && event.key === 'c';
    if (!isCtrlC) {
      event.preventDefault(); // Prevent all other keyboard input
    }
  };
  
  escFunction(event: KeyboardEvent){
    if (event.key === "Escape" && this.state.showPopup) {
      // prevent default
      event.preventDefault();
      this.handleClosePopup();
    }
  }

  ctrlSFunction(event: KeyboardEvent){
    if (event.ctrlKey && event.key === "s"  && this.state.showPopup) {
      // prevent default
      event.preventDefault();
      this.handleSavePopup();
    }
  }

  downloadYAML = () => {
    const element = document.createElement("a");
    const file = new Blob([this.editedText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = this.title+".yaml";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();

    // Remove the element
    document.body.removeChild(element);
  }

  handleButtonClick = () => {
    this.editedText = this.props.exp.display_experiment_yaml_file;
    this.setState({ showPopup: true });
  };

  handleClosePopup = () => {
    this.setState({ showPopup: false, showClonePopup:false, isTextChanged: false });
  };

  handleSavePopup = () => {
    this.props.exp.display_experiment_yaml_file = this.editedText;
    mentored_api.update_experiment_definition(this.props.exp, this.editedText, (response) => {

      if(response.status !== 200){
        toast.error("Error saving experiment definition: " + JSON.stringify(response.data.error), {
          position: toast.POSITION.TOP_CENTER, // Position the toast at the top center
          autoClose: 15000, // Auto close after 5 seconds
          hideProgressBar: false, // Show the progress bar
          closeOnClick: true, // Close on click
          pauseOnHover: true, // Pause the toast on hover
          draggable: true, // Allow toast to be draggable
          progress: undefined,
          // set width
          style: { width: "100%", position: "fixed", left: "25%", textAlign: "center" },
        });
        return;
      }
      
      // Call the callback function if defined
      if(this.props.onSaveCallback) this.props.onSaveCallback(this.editedText);
      
      this.initialText = this.editedText;
      this.handleClosePopup();
      window.location.reload(false);
    });
  }

  handleChangeYAML = (editor, data, value) => {
    // TODO: Add experiment validation here
    if (!this.props.viewOnlyMode) {
      this.editedText = value;
      this.handleTextChange();
    }
  };

  handleTextChange = () => {
    if(this.editedText !== this.initialText){
      this.setState({ isTextChanged: true });
    }else{
      this.setState({ isTextChanged: false });
    }
  };


  render() {
    let { t, exp } = this.props;

    this.yamlEditor = <CodeMirror
      value={this.editedText}
      options={{
        mode: 'yaml',
        theme: 'default',
        lineNumbers: true,
        indentWithTabs: true,
        tabSize: 2,
        indentOnInput: false,
        smartIndent: false,
        extraKeys: {
          'Enter': (cm) => {
              const cursor = cm.getCursor();
              cm.replaceSelection('\n', 'end', '+input');
              cm.setCursor(cursor.line, cursor.ch);
            },
            'Shift-Enter': 'newlineAndIndent'
        },
      }}
      onBeforeChange={(editor, data, value) => this.handleChangeYAML(editor, data, value)}
    />

    return (
      <div>
      {this.state.showPopup ? (
        <div className="popup-overlay">
          
          <div className="popup-content">            
            <h2 className='popup-title-container '>
              {this.title}
            </h2>
            <OverlayTrigger
                    placement="right"
                    delay={{ show: 50, hide: 150 }}
                    overlay={(props) => (
                      <Tooltip id="button-tooltip" {...props}>
                        {t('newdefinition.closeWindow')}
                      </Tooltip>
                    )}
            >
              <div className="close-button">
                <AiOutlineCloseSquare onClick={this.handleClosePopup} className="close-button"/>
              </div>
            </OverlayTrigger>

            <PopUp experiment={exp}/>

            {(exp.all_versions_display.length > 1) ?
            <OverlayTrigger
                    placement="right"
                    delay={{ show: 50, hide: 150 }}
                    overlay={(props) => (
                      <Tooltip id="button-tooltip" {...props}>
                        {t('newdefinition.recoverVersion')}
                      </Tooltip>
                    )}
            >
              <div className="form-group version-button">
                <select className="form-control" onChange={(e) => {
                  const version = parseInt(e.target.value);
                  const newExp = exp.all_versions_display.find((expversion: any) => {return expversion.version === version});
                  this.editedText = newExp.yaml;
                  this.handleTextChange();
                }}>
                  {exp.all_versions_display.map((expversion: any) => (
                    <option key={expversion.version} value={expversion.version} selected={exp.lastVersionNumber === expversion.version}>{expversion.version}</option>
                  ))}
                </select>
              </div>
            </OverlayTrigger>
            : null}

            <OverlayTrigger
                    placement="right"
                    delay={{ show: 50, hide: 150 }}
                    overlay={(props) => (
                      <Tooltip id="button-tooltip" {...props}>
                        {t('newdefinition.download')}
                      </Tooltip>
                    )}
            >
              <div className="save-button">
                {!this.props.viewOnlyMode && <FaFileDownload onClick={this.downloadYAML} className="download-button "/>}
              </div>
            </OverlayTrigger>

            <OverlayTrigger
                    placement="right"
                    delay={{ show: 50, hide: 150 }}
                    overlay={(props) => (
                      <Tooltip id="button-tooltip" {...props}>
                        {t('newdefinition.save')}
                      </Tooltip>
                    )}
            >
              <div className="save-button">
                {!this.props.viewOnlyMode && <FaRegSave onClick={this.handleSavePopup} className="save-button " style={{ color: this.state.isTextChanged ? "green" : 'white' }}/>}
              </div>
            </OverlayTrigger>

            <br></br>
            <br></br>
            <div className="popup-body">
              <div className="background-rectangle-Execution">
                <div className='popup-text-container text-left yaml-editor' ref={this.editorRef}>
                    {this.yamlEditor}
                <ToastContainer />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {!this.props.viewOnlyMode 
      ? (this.props.iconAsTitle
        ? <FaRegEdit onClick={this.handleButtonClick}  className='title-option title-edit-icon'/>
        : <FaRegEdit onClick={this.handleButtonClick}  className='table-icons'/>
        )
      : (this.props.iconAsTitle
        ? <SlEye onClick={this.handleButtonClick} className="title-option title-edit-icon"/>
        : <SlEye onClick={this.handleButtonClick} className="table-icons"/>
        )
      }

      </div>
    );
  }
}

export default withTranslation()(ExperimentDefinitionYAMLView);