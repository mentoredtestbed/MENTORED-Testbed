import React, { useEffect } from 'react';
import '../../assets/css/NewDefinition.css';
import '../../assets/css/NewExecution.css';
import '../../assets/css/tabela.css';
import {mentored_api} from "../../utils/useAxios";
import { AiOutlineCloseSquare } from "react-icons/ai";
import { ImDisplay } from "react-icons/im";
import Iframe from 'react-iframe';
import ProgressBar from '../../pages/components/ProgressBar';
import SortableTable from '../../pages/components/SortableTable';
import { useTranslation } from 'react-i18next';

interface Props {
  exp_def: any;
}

interface State {
  showPopup: any;
  progress: number;
  status: number;
  podnames: any;
}

const { useState, useRef, useLayoutEffect } = React;

const DEV = import.meta.env.DEV;



class ExperimentExecutionMonitor extends React.Component<Props, State> {


  title = 'Lorem Ipsum';
  description = 'a';
  ee_id = 0;
  last_selected_pod: string = "";
  last_namespace: string = "";
  t = (s: string) => s

  constructor(props) {

    super(props);
    this.state = {
      showPopup: false,
      progress: 0,
      status: 0,
      progressComponent: "",
      podnames: []
    };

    this.ee_id = props.ee_id;

    this.t = props.t;

    this.last_selected_pod = "";
    this.last_namespace = "";

    this.escFunction = this.escFunction.bind(this);
  }

  componentDidMount(){
    document.addEventListener("keydown", this.escFunction, false);
  }
  componentWillUnmount(){
    document.removeEventListener("keydown", this.escFunction, false);
  }

  escFunction(event){
    if (event.key === "Escape") {
      this.handleClosePopup();
    }
  }

  handleButtonClick = () => {
    localStorage.setItem('isExperimentMonitorOpen', "true");
    this.setState({ showPopup: true });
  };

  handleClosePopup = () => {
    localStorage.setItem('isExperimentMonitorOpen', "");
    this.setState({ showPopup: false });
  };


  handleChangeYAML = ({ json, text }) => {
    console.log(text);
  };


  updateIframe(podname: string, namespace: string){
    this.last_selected_pod = podname;
    this.last_namespace = namespace;

    mentored_api.get_webkubectl_token(()=>{}, (resp)=>{
      var token = resp["token"];
      var iframe = document.getElementById('iframe') as HTMLIFrameElement;
      var url = mentored_api.webkubectlURL +'/terminal/?podname=' + podname + '&token=' + token + '&namespace=' + namespace;

      console.log(url);
      if (iframe) {
        iframe.src = url;
      }
      else{
        console.log('iframe not found');
      }
    });
  }

  open_pod_in_new_tab(){
    if (this.last_selected_pod == ""){
      console.log('No pod selected');
      return;
    }
    mentored_api.get_webkubectl_token(()=>{}, (resp)=>{
      var token = resp["token"];
        var iframe = document.getElementById('iframe') as HTMLIFrameElement;
        var url = mentored_api.webkubectlURL +'/terminal/?podname=' + this.last_selected_pod + '&token=' + token + '&namespace=' + this.last_namespace;
        if(iframe){
          // open url in new tab
          window.open(url, '_blank');
        }
        else{
          console.log('[ERROR] url not found');
        }
    });
  }

  open_all_pods_in_new_tab(podlist){
    if (podlist == undefined){
      console.log('No pod selected');
      return;
    }
    this.open_all_pods_in_new_tab_next(0, podlist);

  }

  open_all_pods_in_new_tab_next(current_idx, podlist){
    if (podlist == undefined){
      console.log('No pod selected');
      return;
    }
    if (current_idx >= podlist.length){
      console.log('All pods opened');
      return
    }

    mentored_api.get_webkubectl_token(()=>{}, (resp)=>{
      var token = resp["token"];

      var url = mentored_api.webkubectlURL +'/terminal/?podname=' + podlist[current_idx].podname + '&token=' + token + '&namespace=' + podlist[current_idx].namespace;
      console.log(url);
      window.open(url, '_blank');

      setTimeout(() => {
        this.open_all_pods_in_new_tab_next(current_idx + 1, podlist);
      }, 50);
    });
  }



  get_dataTable = (setState, cb) => {
    mentored_api.get_running_pods(setState, (d) => {
      this.setState({
        progress: d["progress"],
        status: d["status"],
        podnames: d["podnames"]
      });

      cb(d["podnames"]);
    }, this.ee_id);
  }


  render() {
    // Set local storage
    let exp_def = this.props.exp_def;
    // const {progress, status, progressComponent} = this.state;

    const create_col_prototype = (row) => {
      return [
        <button class='button' style={{"margin-bottom": "5px"}} onClick={() => this.updateIframe(row.podname, row.namespace)}>{row.podname}</button>,
      ]
    }

    const get_sortable_name = (row) => {
      return [row.podname];
    }

    const create_header_prototype = () => {

      return [
          <td className='col-md-3 text-label' ><b></b></td>,
      ]
    }

    var podlist = <SortableTable 
            get_sortable_name={get_sortable_name}
            get_dataTable={this.get_dataTable}
            tableTitle={""}
            alwaysReload={true}
            reloadTime={5000}
            create_col_prototype={create_col_prototype}
            create_header_prototype={create_header_prototype}
            sortByName={false}
            />

    return (
      <div id="main_popup_monitor">
      {this.state.showPopup ? (
        <div className="popup-overlay">
          <div className="popup-content">         
            <AiOutlineCloseSquare onClick={this.handleClosePopup} className="close-button"/>
            <h2 className='popup-title-container '>
              {exp_def}
            </h2>
            <br></br>
            <br></br>
            <div className="popup-body">
              <div className="background-rectangle-Execution">
                <div className="progress-bar-container">
                {this.state.status == 1 && <span style={{ color: 'yellow', textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}> Warming up </span>}
                {this.state.progress > -1 ? <ProgressBar width="300px" height='30px'
                                            showButton={false}
                                            showPercentage={true}
                                            reloadTime={0}
                                            initialProgress={this.state.progress} /> : ""}
                </div>
                <div className='row'>
                  <div className='popup-text-container col-md-4'>
                    <button class='button' style={{"margin-top": "5px", "margin-bottom": "5px", "height": "auto"}} onClick={()=>{this.open_all_pods_in_new_tab(this.state.podnames)}}>Open all pods in another tabs</button>
                    <h3>Pods</h3>
                    <div className='popup-text-container '>
                      {podlist}
                    </div>
                  </div>
                  <div className='col-md-7'>
                    <button class='button' style={{"margin-top": "5px", "margin-bottom": "5px", "height": "auto"}} onClick={()=>{this.open_pod_in_new_tab()}}>Open in another tab</button>
                    <br></br>
                    <p id="default_iframe_div" className='popup-text-container'>
                        <Iframe url={mentored_api.webkubectlURL}
                        width="100%"
                        height="300vh"
                        id="iframe"
                        display="block"
                        position="relative"/>
                    </p>
                  </div>
                </div>

              </div>
            </div>


          </div>
        </div>
        ) : null}
        <ImDisplay onClick={this.handleButtonClick} className="table-icons" />
      </div>
    );
  }
}

export default ExperimentExecutionMonitor;
