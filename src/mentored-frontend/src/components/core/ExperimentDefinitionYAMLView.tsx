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


interface Props {
  exp: any;
}

interface State {
  showPopup: any;
}

const { useState, useRef, useLayoutEffect } = React;

// const [showPopup, setShowPopup] = useState(false);


const text = `
foo: bar
`;




class ExperimentDefinitionYAMLView extends React.Component<Props, State> {
  
  
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
  
  render() {

    let exp = this.props.exp;
    
    return (
      <div>
      {this.state.showPopup ? (
        <div className="popup-overlay">
          <div className="popup-content"  style={{ overflow: 'auto' }}>            
            <AiOutlineCloseSquare onClick={this.handleClosePopup} className="close-button "/>
            <div className="background-rectangle-Execution mt-6vh">
            <h2 className='popup-title-container '>
                {this.title}
              </h2>
              <p className='popup-text-container text-left' >
                  {/* {this.description} */}
                  <YamlEditor text={exp.display_experiment_yaml_file} onChange={this.handleChangeYAML} />
              </p>

              </div>
              
          </div>
        </div>
      ) : null}
      {/* <button  className="newrequest-button"> */}
        <SlEye onClick={this.handleButtonClick}  className='table-icons'/>
        {/* a */}
      {/* </button> */}
    </div>
    );
  }
}

export default ExperimentDefinitionYAMLView;


// import React, { useState } from 'react';
// // import '../../assets/css/NewDefinition.css';
// // import '../../assets/css/NewExecution.css';
// import { AiOutlineCloseSquare } from "react-icons/ai";



// function ExperimentDefinitionYAMLView() {
//   const [showPopup, setShowPopup] = useState(false);

//   const handleButtonClick = () => {
//     setShowPopup(true);
//   }

//   const handleClosePopup = () => {
//     setShowPopup(false);
//   }

//   let title = 'Lorem Ipsum'
//   let description = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia, molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum numquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentium optio, eaque rerum!'

//   return (
//     <div>
//       {showPopup ? (
//         <div className="popup-overlay">
//           <div className="popup-content">            
//             <AiOutlineCloseSquare onClick={handleClosePopup} className="close-button"/>
//             <div className="background-rectangle-Execution ">
//               <h2 className='popup-title-Execution '>
//                 {title}
//               </h2>
//               <p className='popup-text-Execution '>
//                   {description}
//               </p>

//               </div>
              
//               <div className='col-md-12'>
//                 Test YAML View
//               </div>
              
//           </div>
//         </div>
//       ) : null}
//       <button onClick={handleButtonClick} className="newrequest-button">
//         <h1 className='button-text'>
//           New
//           <br />
//           Execution
//           </h1>
//       </button>
//     </div>
//   );
// }

// export default ExperimentDefinitionYAMLView;
