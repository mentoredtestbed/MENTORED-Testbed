import React from 'react';
import '../../assets/css/tabela.css';
import { BsSearch } from "react-icons/bs";
import { withTranslation, WithTranslation } from 'react-i18next';

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

class ExperimentsTable extends React.Component<Props & WithTranslation, State> {

  constructor(props) {
    super(props);
    this.state = {
      rows: [],
      searchTerm: '',
    };
  }

  componentDidMount() { 
    this.props.get_dataTable((d) => { }, (d) => { this.setState({ rows: d }) }) 
  }

  handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      searchTerm: event.target.value,
    });
  }

  render() {

    const filteredRows = this.state.rows.filter(row =>
      this.props.get_sortable_name(row).toLowerCase().includes(this.state.searchTerm.toLowerCase())
    );

    const { t } = this.props;  

    let tabletitle = this.props.tableTitle;
    let create_col_prototype = this.props.create_col_prototype;
    let create_header_prototype = this.props.create_header_prototype;
    let searchPlaceHolder = t('table.searchplaceholder');  

    return (
      <div className="conrainer-fluid">
        <div className='col-md-13' >
          <div className='header-table d-inline-flex p-2 justify-content-between col-md-12' >
            <h1 className='title-table '>{tabletitle}</h1>

            <input className='search w-25vw'
              type="text"
              placeholder={searchPlaceHolder}
              value={this.state.searchTerm}
              onChange={this.handleSearchChange}
            />

            <BsSearch className="search-iconeStyle mr-0.4vw" />

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

export default withTranslation()(ExperimentsTable);