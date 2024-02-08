import React, { useEffect } from 'react';
import '../../assets/css/NewDefinition.css';
import '../../assets/css/NewExecution.css';
import '../../assets/css/tabela.css';
import {mentored_api} from "../../utils/useAxios";
import { AiOutlineCloseSquare } from "react-icons/ai";
import { ImDisplay } from "react-icons/im";
import Iframe from 'react-iframe';

interface Props {
  exp_def: any;
}

interface State {
  showPopup: any;
}

const { useState, useRef, useLayoutEffect } = React;


class ExperimentExecutionMonitor extends React.Component<Props, State> {
  
  
  title = 'Lorem Ipsum'
  description = 'a'

  constructor(props) {

    super(props);
    this.state = {
      showPopup: false,
    };
  }

  handleButtonClick = () => {
    this.setState({showPopup: true});
  }

  handleClosePopup = () => {
    this.setState({showPopup: false});
  }

  
  handleChangeYAML = ({ json, text }) => {
    console.log(text);
  };


  
  render() {

    let exp_def = this.props.exp_def;

    return (
      <div>
      {this.state.showPopup ? (
        <div className="popup-overlay">
          <div className="popup-content">            
            <AiOutlineCloseSquare onClick={this.handleClosePopup} className="close-button"/>
            <div className="background-rectangle-Execution mt-6vh">
              <h2 className='popup-title-container '>
                {this.title}
              </h2>
              <p className='popup-text-container '>
                  {/* {this.description} */}
                  <Iframe url={mentored_api.webkubectlURL}
                  // width="640px"
                  // height="320px"
                  id=""
                  className="w-70vw h-55vh"
                  display="block"
                  position="relative"/>
              </p>

              </div>
              
          </div>
        </div>
      ) : null}
      {/* <button  className="newrequest-button"> */}
        <ImDisplay onClick={this.handleButtonClick} className='table-icons'/>
        {/* a */}
      {/* </button> */}
    </div>
    );
  }
}

export default ExperimentExecutionMonitor;