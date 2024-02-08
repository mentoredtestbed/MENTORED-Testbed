import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Dashboard from '../layouts/dashboard';
import 'chart.js/auto';
import '../assets/css/experiments.css'
import '../assets/css/tabela.css'
import SortableTable from "./components/SortableTable"
import PopUp from "./components/NewDefinition";
import { mentored_api } from "../utils/useAxios";
import ExperimentDefinitionYAMLView from "../components/core/ExperimentDefinitionYAMLView";

const DEV = import.meta.env.DEV;

import CRUDButton from '../components/core/CRUDButton'

export default function Experiments() {
    const { t } = useTranslation();

    let projectTitle = t('table.project') + " 1";

    let create_col_prototype = (row) => {
        return [
            <td className='col-md-3 '>{row.exp_name}</td>,
            <td className='col-md-3 text-center'><ExperimentDefinitionYAMLView exp={row} className=' table-icons' /></td>,
            <td className='col-md-3 text-center'><CRUDButton operation='update'
                                                  name={row.exp_name}
                                                  triggerFunction={() => {
                                                    alert("Function not implemented");
                                                  }}
                                                  /></td>,
            <td className='col-md-3 text-center'><CRUDButton operation='delete'
                                                  name={row.exp_name}
                                                  triggerFunction={() => {
                                                    mentored_api.delete_experiment_definition(row.id, (d) => {
                                                      window.location.reload(false);
                                                    });
                                                  }}
            /></td>
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

    let get_dataTable = (setState, cb) => {

        if (DEV) {
            let d = [{ "id": 4, "url": mentored_api.apiURL+"/experiments/4/?format=json", "exp_name": "mentored-testbed-demo", "experiment_yaml_file": null,  "display_experiment_yaml_file": null }, { "id": 5, "url": mentored_api.apiURL+"/experiments/5/?format=json", "exp_name": "teste-yaml-upload", "experiment_yaml_file": null,  "display_experiment_yaml_file": null }, { "id": 6, "url": mentored_api.apiURL+"/experiments/6/?format=json", "exp_name": "teste-yaml-upload-2", "experiment_yaml_file": null,  "display_experiment_yaml_file": "Experiment:\n  name: mentored-testbed-demo\n  nodeactors:\n    - name: 'na-server'\n      replicas: 1\n      containers:\n        - name: tcpdump\n          image: ghcr.io/brunomeyer/nginx-server\n          imagePullPolicy: \"Always\"\n          env:\n            - name: TIMEOUT_CMD\n              value: \"300\"\n          command: [\"/app/entry.sh\"]\n          args: [\"python3\", \"save_throughput.py\"]\n          securityContext:\n            privileged: true\n        - name: nginx\n          image: nginx\n          securityContext:\n            privileged: true\n          ports:\n            - containerPort: 80\n          resources:\n            requests:\n              memory: \"1G\"\n              cpu: \"1\"\n            limits:\n              memory: \"2G\"\n              cpu: \"2\"\n      region: 'whx-es'\n    - name: 'na-botnet'\n      replicas: 2\n      containers:\n        - name: botnet\n          image: ghcr.io/brunomeyer/generic-botnet\n          imagePullPolicy: \"Always\"\n          env:\n            - name: PROTOCOL\n              value: \"ICMP\"\n            - name: TIMEOUT_CMD\n              value: \"180\"\n            - name: TIME_WAIT_START\n              value: \"60\"\n            - name: NET_INTERFACE\n              value: ovs-link\n          command: [\"./entry.sh\"]\n          args: [\"hping3\", \"-S\", \"--faster\", \"-p\", \"80\"]\n          securityContext:\n            privileged: true\n          resources:\n            requests:\n              memory: \"64M\"\n              cpu: \"0.5\"\n            limits:\n              memory: \"128M\"\n              cpu: \"1\"\n      region: 'whx-ba'\n    - name: 'na-client'\n      replicas: 3\n      containers:\n        - name: client\n          image: ghcr.io/brunomeyer/generic-client\n          imagePullPolicy: \"Always\"\n          env:\n            - name: TIMEOUT_CMD\n              value: \"300\"\n          command: [\"./entry.sh\"]\n          args: ['python3', 'client_metrics.py']\n          securityContext:\n            privileged: true\n          resources:\n            requests:\n              memory: \"64M\"\n              cpu: \"0.5\"\n            limits:\n              memory: \"128M\"\n              cpu: \"1\"\n      region: 'whx-sp'\n  topology: 'ovs_fully_connected'\n" }];
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