import React, { useEffect } from 'react';

import '../../assets/css/NewDefinition.css';
import '../../assets/css/NewExecution.css';


// import * as React from 'react';
import data from '../../../public/dados.json'; // im
import '../../assets/css/tabela.css';
import { BsSearch } from "react-icons/bs";

import {mentored_api} from "../../utils/useAxios";

import { SlEye } from "react-icons/sl";
import { TiPencil } from "react-icons/ti";
import { TiDeleteOutline } from "react-icons/ti";
import { AiOutlineCloseSquare } from "react-icons/ai";

import { ImDisplay } from "react-icons/im";

import YamlEditor from '@focus-reactive/react-yaml';

import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css

import { FiDownload } from "react-icons/fi";

// import { TiPencil } from "react-icons/ti";
// import { TiDeleteOutline } from "react-icons/ti";


interface Props {
  operation: any;
  triggerFunction: any;
  name: any;
}

interface State {
  showPopup: any;
}

const { useState, useRef, useLayoutEffect } = React;

// const [showPopup, setShowPopup] = useState(false);


const text = `
foo: bar
`;




class CRUDButton extends React.Component<Props, State> {
  
  
  title = 'Experiment Definition (YAML)'
  description = ''

  constructor(props) {
    // const [dataTable, setDataTable] = React.useState([]);

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

  // componentDidMount() { mentored_api.get_experiments_definitions(this.setExp_list, (d) => {this.setState({rows: d})});  }
  // componentDidMount() { this.props.get_dataTable((d) => {}, (d) => {this.setState({rows:d})})  }
  
  handleChangeYAML = ({ json, text }) => {
    console.log(text);
    // "foo: bar"
  };
  
  submit = () => {
    let operation = this.props.operation;
    let cb = this.props.triggerFunction;
    let name = this.props.name;

    confirmAlert({
      title: <b>{operation}</b>,
      message: 'Are you sure to do this? ('+operation+' '+name+')',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {cb();}
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ]
    });
  };




  render() {

    let operation = this.props.operation;
    let triggerFunction = this.props.triggerFunction;

    let icon_html = ""
    if(operation == 'create'){
      icon_html = "";
    }
    if(operation == 'read'){
      icon_html = "";
    }
    if(operation == 'update'){
      icon_html = (<TiPencil onClick={this.submit} className=' table-icons' />);
    }
    if(operation == 'delete'){
      icon_html = (<TiDeleteOutline onClick={this.submit} className=' table-icons' />);
    }
    if(operation == 'download'){
      icon_html = (<FiDownload onClick={this.submit} className=' table-icons' />);
    }
    
    return (
    <div>
        {icon_html}
    </div>
    );


  }
}

export default CRUDButton;

