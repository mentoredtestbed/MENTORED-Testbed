import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Dashboard from '../layouts/dashboard';
import 'chart.js/auto';
import '../assets/css/experiments.css'
import '../assets/css/tabela.css'
import SortableTable from "./components/SortableTable"
import PopUp from "./components/NewDefinition";
import { TiPencil } from "react-icons/ti";
import { TiDeleteOutline } from "react-icons/ti";


import { mentored_api } from "../utils/useAxios";
import ExperimentDefinitionYAMLView from "../components/core/ExperimentDefinitionYAMLView";

const DEV = import.meta.env.DEV;

export default function Experiments() {
    const { t } = useTranslation();

    let projectTitle = t('table.project') + " 1";

    let create_col_prototype = (row) => {
        return [
            <td className='col-md-3 '>{row.exp_name}</td>,
            <td className='col-md-3 text-center'><ExperimentDefinitionYAMLView exp={row} className=' table-icons' /></td>,
            <td className='col-md-3 text-center'><TiPencil className=' table-icons' /></td>,
            <td className='col-md-3 text-center'><TiDeleteOutline className=' table-icons' /></td>
        ]
    }

    let get_sortable_name = (row) => {
        return row.exp_name;
    }

    let create_header_prototype = () => {

        return [
            <td className='col-md-3 text-label' ><b>{t('table.name')}</b></td>,
            <td className='col-md-3 text-label text-center' ><b>{t('table.visualize')}</b></td>,
            <td className='col-md-3 text-label text-center' ><b>{t('table.edit')}</b></td>,
            <td className='col-md-3 text-label text-center' ><b>{t('table.delete')}</b></td>
        ]
    }

    // const [exp_list, setExp_list] = useState([]);
    // const [exp_list, setExp_list] = useState([{"id":4,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/4/?format=json","exp_name":"mentored-testbed-demo","experiment_yaml_file":null},{"id":5,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/5/?format=json","exp_name":"teste-yaml-upload","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/mentored-testbed-demo.yaml"},{"id":6,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/6/?format=json","exp_name":"teste-yaml-upload-2","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_1/12/10/2022_233514mentored-testbed-demo.yaml"},{"id":7,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/7/?format=json","exp_name":"teste-yaml-upload-3","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_1/12/10/2022_233635mentored-testbed-demo.yaml"},{"id":8,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/8/?format=json","exp_name":"teste-yaml-upload-4","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_1/1665618663.215836_teste-yaml-upload-4.yaml"},{"id":9,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/9/?format=json","exp_name":"teste-yaml-upload-5","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_1/1665619387.2025948_teste-yaml-upload-5.yaml"},{"id":10,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/10/?format=json","exp_name":"experiment-globecom-ids-mg-ids-go-ids-sc","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_1/1667918108.1888175_experiment-globecom-ids-mg-ids-go-ids-sc.yaml"},{"id":11,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/11/?format=json","exp_name":"infection-scenario","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_1/1669215430.8581066_infection-scenario.yaml"},{"id":12,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/12/?format=json","exp_name":"infection-scenario-2","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_1/1669216011.778702_infection-scenario-2.yaml"},{"id":13,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/13/?format=json","exp_name":"infection-scenario-3","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_1/1669229112.2928925_infection-scenario-3.yaml"},{"id":14,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/14/?format=json","exp_name":"infection-scenario-4","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_1/1669230692.7257879_infection-scenario-4.yaml"},{"id":15,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/15/?format=json","exp_name":"infection-scenario-5","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_1/1669231968.4887_infection-scenario-5.yaml"},{"id":16,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/16/?format=json","exp_name":"infection-scenario-6","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_1/1669813890.8746371_infection-scenario-6.yaml"},{"id":17,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/17/?format=json","exp_name":"infection-scenario-7","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_1/1669814840.6157296_infection-scenario-7.yaml"},{"id":18,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/18/?format=json","exp_name":"infection-scenario-8","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_1/1669815063.9027786_infection-scenario-8.yaml"},{"id":19,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/19/?format=json","exp_name":"infection-scenario-9","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_1/1669815154.3012252_infection-scenario-9.yaml"},{"id":20,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/20/?format=json","exp_name":"infection-scenario-10","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_1/1669819486.5175996_infection-scenario-10.yaml"},{"id":21,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/21/?format=json","exp_name":"infection-scenario-11","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_1/1669825351.0981746_infection-scenario-11.yaml"},{"id":22,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/22/?format=json","exp_name":"test-api","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_2/1674745307.797235_test-api.yaml"},{"id":23,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/23/?format=json","exp_name":"test-api-2","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_2/1674819735.4010706_test-api-2.yaml"},{"id":24,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/24/?format=json","exp_name":"test","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_2/1674820417.334287_test.yaml"},{"id":25,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/25/?format=json","exp_name":"test-2","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_2/1674840340.8378637_test-2.yaml"},{"id":26,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/26/?format=json","exp_name":"api-infection-test","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_2/1674846481.207946_api-infection-test.yaml"},{"id":27,"url":"https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/27/?format=json","exp_name":"api-infection-test","experiment_yaml_file":"https://mentored-testbed.cafeexpresso.rnp.br/uploads/user_2/1674846490.8273413_api-infection-test.yaml"}],);

    // mentored_api.get_experiments_definitions(setExp_list, (d) => {setState({rows: d})});

    let get_dataTable = (setState, cb) => {

        if (DEV) {
            let d = [{ "id": 4, "url": "https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/4/?format=json", "exp_name": "mentored-testbed-demo", "experiment_yaml_file": null,  "display_experiment_yaml_file": null }, { "id": 5, "url": "https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/5/?format=json", "exp_name": "teste-yaml-upload", "experiment_yaml_file": null,  "display_experiment_yaml_file": null }, { "id": 6, "url": "https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/6/?format=json", "exp_name": "teste-yaml-upload-2", "experiment_yaml_file": null,  "display_experiment_yaml_file": "Experiment:\n  name: mentored-testbed-demo\n  nodeactors:\n    - name: 'na-server'\n      replicas: 1\n      containers:\n        - name: tcpdump\n          image: ghcr.io/brunomeyer/nginx-server\n          imagePullPolicy: \"Always\"\n          env:\n            - name: TIMEOUT_CMD\n              value: \"300\"\n          command: [\"/app/entry.sh\"]\n          args: [\"python3\", \"save_throughput.py\"]\n          securityContext:\n            privileged: true\n        - name: nginx\n          image: nginx\n          securityContext:\n            privileged: true\n          ports:\n            - containerPort: 80\n          resources:\n            requests:\n              memory: \"1G\"\n              cpu: \"1\"\n            limits:\n              memory: \"2G\"\n              cpu: \"2\"\n      region: 'whx-es'\n    - name: 'na-botnet'\n      replicas: 2\n      containers:\n        - name: botnet\n          image: ghcr.io/brunomeyer/generic-botnet\n          imagePullPolicy: \"Always\"\n          env:\n            - name: PROTOCOL\n              value: \"ICMP\"\n            - name: TIMEOUT_CMD\n              value: \"180\"\n            - name: TIME_WAIT_START\n              value: \"60\"\n            - name: NET_INTERFACE\n              value: ovs-link\n          command: [\"./entry.sh\"]\n          args: [\"hping3\", \"-S\", \"--faster\", \"-p\", \"80\"]\n          securityContext:\n            privileged: true\n          resources:\n            requests:\n              memory: \"64M\"\n              cpu: \"0.5\"\n            limits:\n              memory: \"128M\"\n              cpu: \"1\"\n      region: 'whx-ba'\n    - name: 'na-client'\n      replicas: 3\n      containers:\n        - name: client\n          image: ghcr.io/brunomeyer/generic-client\n          imagePullPolicy: \"Always\"\n          env:\n            - name: TIMEOUT_CMD\n              value: \"300\"\n          command: [\"./entry.sh\"]\n          args: ['python3', 'client_metrics.py']\n          securityContext:\n            privileged: true\n          resources:\n            requests:\n              memory: \"64M\"\n              cpu: \"0.5\"\n            limits:\n              memory: \"128M\"\n              cpu: \"1\"\n      region: 'whx-sp'\n  topology: 'ovs_fully_connected'\n" }];
            setState(d);
            cb(d);
        }
        else {
            mentored_api.get_experiments_definitions(setState, (d) => { cb(d) });
        }
    }

    useEffect(() => {

    }, []);

    return (
        <Dashboard >
            <div className='container-fluid'>
                <div className='row'>
                    <div className='title top-5 col-md-10 h-11vh'>
                        <h1 className='top-3vh'>{projectTitle}</h1>
                    </div>
                    <div className='col-md-2'>
                        <PopUp />
                    </div>
                </div>
                <div className='row top-10'>
                    <div className="table-size col-md-12" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
                        <SortableTable get_sortable_name={get_sortable_name} get_dataTable={get_dataTable} tableTitle={t('table.definitions')} create_col_prototype={create_col_prototype} create_header_prototype={create_header_prototype} />
                    </div>
                </div>
            </div>
        </Dashboard>
    );
}