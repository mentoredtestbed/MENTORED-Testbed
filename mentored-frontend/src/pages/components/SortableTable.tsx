import React, { useEffect } from 'react';
import '../../assets/css/tabela.css';
import { BsSearch } from "react-icons/bs";
import { mentored_api } from "../../utils/useAxios";

interface Row {
  id: number;
  name: string;
  age: number;
}

interface Props {
  tableTitle: string;
  create_col_prototype: any;
  create_header_prototype: any;
  get_sortable_name: any;
  get_dataTable: any;
}

interface State {
  rows: Row[];
  searchTerm: string;
}

const { useState, useRef, useLayoutEffect } = React;



class ExperimentsTable extends React.Component<Props, State> {


  constructor(props) {
    // const [dataTable, setDataTable] = React.useState([]);

    super(props);
    this.state = {
      // rows: [{"id":4,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/4/?format=json","exp_name":"mentored-testbed-demo","experiment_yaml_file":null},{"id":5,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/5/?format=json","exp_name":"teste-yaml-upload","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/mentored-testbed-demo.yaml"},{"id":6,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/6/?format=json","exp_name":"teste-yaml-upload-2","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_1/12/10/2022_233514mentored-testbed-demo.yaml"},{"id":7,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/7/?format=json","exp_name":"teste-yaml-upload-3","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_1/12/10/2022_233635mentored-testbed-demo.yaml"},{"id":8,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/8/?format=json","exp_name":"teste-yaml-upload-4","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_1/1665618663.215836_teste-yaml-upload-4.yaml"},{"id":9,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/9/?format=json","exp_name":"teste-yaml-upload-5","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_1/1665619387.2025948_teste-yaml-upload-5.yaml"},{"id":10,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/10/?format=json","exp_name":"experiment-globecom-ids-mg-ids-go-ids-sc","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_1/1667918108.1888175_experiment-globecom-ids-mg-ids-go-ids-sc.yaml"},{"id":11,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/11/?format=json","exp_name":"infection-scenario","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_1/1669215430.8581066_infection-scenario.yaml"},{"id":12,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/12/?format=json","exp_name":"infection-scenario-2","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_1/1669216011.778702_infection-scenario-2.yaml"},{"id":13,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/13/?format=json","exp_name":"infection-scenario-3","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_1/1669229112.2928925_infection-scenario-3.yaml"},{"id":14,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/14/?format=json","exp_name":"infection-scenario-4","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_1/1669230692.7257879_infection-scenario-4.yaml"},{"id":15,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/15/?format=json","exp_name":"infection-scenario-5","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_1/1669231968.4887_infection-scenario-5.yaml"},{"id":16,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/16/?format=json","exp_name":"infection-scenario-6","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_1/1669813890.8746371_infection-scenario-6.yaml"},{"id":17,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/17/?format=json","exp_name":"infection-scenario-7","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_1/1669814840.6157296_infection-scenario-7.yaml"},{"id":18,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/18/?format=json","exp_name":"infection-scenario-8","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_1/1669815063.9027786_infection-scenario-8.yaml"},{"id":19,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/19/?format=json","exp_name":"infection-scenario-9","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_1/1669815154.3012252_infection-scenario-9.yaml"},{"id":20,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/20/?format=json","exp_name":"infection-scenario-10","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_1/1669819486.5175996_infection-scenario-10.yaml"},{"id":21,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/21/?format=json","exp_name":"infection-scenario-11","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_1/1669825351.0981746_infection-scenario-11.yaml"},{"id":22,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/22/?format=json","exp_name":"test-api","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_2/1674745307.797235_test-api.yaml"},{"id":23,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/23/?format=json","exp_name":"test-api-2","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_2/1674819735.4010706_test-api-2.yaml"},{"id":24,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/24/?format=json","exp_name":"test","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_2/1674820417.334287_test.yaml"},{"id":25,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/25/?format=json","exp_name":"test-2","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_2/1674840340.8378637_test-2.yaml"},{"id":26,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/26/?format=json","exp_name":"api-infection-test","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_2/1674846481.207946_api-infection-test.yaml"},{"id":27,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/27/?format=json","exp_name":"api-infection-test","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_2/1674846490.8273413_api-infection-test.yaml"}],
      rows: [],
      // rows: dataTable,
      searchTerm: '',
    };
  }

  // componentDidMount() { mentored_api.get_experiments_definitions(this.setExp_list, (d) => {this.setState({rows: d})});  }
  componentDidMount() { this.props.get_dataTable((d) => { }, (d) => { this.setState({ rows: d }) }) }

  // componentDidUpdate() {    document.title = `You clicked ${this.state.count} times`;  }

  // setExp_list = (d) => {
  //   this.state.rows = d;
  // };



  handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      searchTerm: event.target.value,
    });
  }

  render() {

    // useEffect(() => {
    //   // mentored_api.get_experiments_definitions(this.setExp_list, (d) => {});
    //   mentored_api.get_experiments_definitions(this.setExp_list, (d) => {this.setState({rows: this.exp_list})});
    // }, []);


    const filteredRows = this.state.rows.filter(row =>
      this.props.get_sortable_name(row).toLowerCase().includes(this.state.searchTerm.toLowerCase())
    );

    let tabletitle = this.props.tableTitle;
    let create_col_prototype = this.props.create_col_prototype;
    let create_header_prototype = this.props.create_header_prototype;

    return (
      <div className="conrainer-fluid">
        <div className='col-md-13' >
          <div className='header-table d-inline-flex p-2 justify-content-between col-md-12' >
            <h1 className='title-table '>{tabletitle}</h1>

            <input className='search w-25vw'
              type="text"
              placeholder="Type something here! "
              value={this.state.searchTerm}
              onChange={this.handleSearchChange}
            />

            <BsSearch className="search-iconeStyle mr-0.4vw" />

            {/* <hr className='line'/>   */}


          </div>
          <table className='col-md-12 table-background'>
            <thead>
              <tr>
                {create_header_prototype()}
              </tr>
            </thead>
            <tbody className='col-md-12' >
              {filteredRows.map(row => (
                <tr className='col-md-12 experiment-name align-self-lg-center' key={row.id} >
                  {create_col_prototype(row)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default ExperimentsTable;