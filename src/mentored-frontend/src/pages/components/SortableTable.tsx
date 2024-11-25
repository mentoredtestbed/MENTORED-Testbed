import React from 'react';
import '../../assets/css/tabela.css';
import { withTranslation, WithTranslation } from 'react-i18next';
import { BsSearch } from 'react-icons/bs';
import Loading from './Loading';

interface Row {
  id: number;
  name: string;
  age: number;
}

interface Props extends WithTranslation {
  tableTitle: string;
  create_col_prototype: (row: Row) => React.ReactNode;
  create_header_prototype: () => React.ReactNode[];
  get_sortable_name: (row: Row) => string[];
  get_dataTable: (callbackStart: () => void, callbackSuccess: (data: Row[]) => void, callbackError: (error: any) => void) => void;
  reloadTime?: number;
  maxHeight: string;
  alwaysReload?: boolean;
  sortByName: boolean;
}

interface State {
  rows: Row[];
  searchTerm: string;
  loading: boolean;
  alwaysReload: boolean;
}

class ExperimentsTable extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      rows: [],
      searchTerm: '',
      loading: true,
      alwaysReload: false,
    };
  }

  componentDidMount() {
    this.loadData();
    if (this.props.reloadTime && this.props.reloadTime > 0) {
      setInterval(this.loadData, this.props.reloadTime);
    }
  }

  loadData = () => {
    this.props.get_dataTable(
      () => {},
      (data) => {
        // Compare data with this.state.rows
        // If data is different from this.state.rows, update
        const sortedData = this.props.sortByName ? this.sortRows(data) : data;
        
        if (JSON.stringify(sortedData) === JSON.stringify(this.state.rows)) {
          this.setState({ loading: false });
          return;
        }
        
        if(!this.props.alwaysReload){
          if (localStorage.getItem('isExperimentMonitorOpen') == "true"){
            this.setState({ loading: false });
            return;
          }
  
          if (localStorage.getItem('isNewExperimentExecutionOpen') == "true"){
            this.setState({ loading: false });
            return;
          }
        }

        this.setState({ loading: true });
        setTimeout(() => {
          this.setState({ rows: sortedData, loading: false });
        }, 500);
      },
      (error) => {
        console.error('Error fetching data:', error);
        this.setState({ loading: false });
      }
    );
  };

  

  sortRows = (rows: Row[]) => {
    const { get_sortable_name } = this.props;

    const extractNumber = (name: string) => {
      const match = name.match(/(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    };

    return rows.sort((a, b) => {
      const nameA = get_sortable_name(a).join(' ').toLowerCase();
      const nameB = get_sortable_name(b).join(' ').toLowerCase();

      const numberA = extractNumber(nameA);
      const numberB = extractNumber(nameB);

      return numberB - numberA;
    });
  };

  handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      searchTerm: event.target.value,
    });
  };

  filterRows = () => {
    const { searchTerm, rows } = this.state;
    const term = searchTerm.toLowerCase();
    return rows.filter(row => {
      const sortableNames = this.props.get_sortable_name(row).join(' ').toLowerCase();
      return sortableNames.includes(term);
    });
  };

  renderTableContent = () => {
    const filteredRows = this.filterRows();
    if (filteredRows.length > 0) {
      return filteredRows.map((row) => (
        <tr key={row.id}>{this.props.create_col_prototype(row)}</tr>
      ));
    }
    return (
      <tr>
        <td colSpan={this.props.create_header_prototype().length} className="text-center">
          {this.props.t('table.noData')}
        </td>
      </tr>
    );
  };

  render() {
    const { tableTitle, create_header_prototype, maxHeight, t } = this.props;
    const { loading, searchTerm } = this.state;

    return (
      <div className="container-fluid">
        <div className="col-md-13">
          <div className="header-table d-inline-flex p-2 justify-content-between col-md-12">
            <h1 className="title-table">{tableTitle}</h1>
            <input
              className="search w-25vw"
              type="text"
              placeholder={t('table.searchplaceholder')}
              value={searchTerm}
              onChange={this.handleSearchChange}
            />
            <BsSearch className="search-iconeStyle mr-0.4vw" />
          </div>
          <div className="table-container" style={{ maxHeight: maxHeight }}>
            <div className="header-table-fixed">
              <table className="col-md-12 table-background">
                <thead><tr>{create_header_prototype()}</tr></thead>
              </table>
            </div>
            <div className="body-table">
              <table className="col-md-12 table-background">
                <tbody>
                  {!loading ? this.renderTableContent() : <Loading insideTable={true} />}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withTranslation()(ExperimentsTable);
