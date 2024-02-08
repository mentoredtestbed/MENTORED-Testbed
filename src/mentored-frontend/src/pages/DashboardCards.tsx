import { useState, useEffect } from 'react';

import { useTranslation } from 'react-i18next';

import '../assets/css/dashboard.css'

import Card from '../components/core/Card';

import { mentored_api } from "../utils/useAxios";

import ExperimentDefinitionYAMLView from "../components/core/ExperimentDefinitionYAMLView";
import ExperimentExecutionMonitor from "../components/core/ExperimentExecutionMonitor";

const DEV = import.meta.env.DEV;


export default function Component() {

    const [exp_list, setExp_list] = useState([]);
    const [exec_list, setExec_list] = useState([]);
    const { t } = useTranslation();

    let get_exp_data = () => {

        if (DEV) {
            let d = [{ "id": 4, "url": mentored_api.apiURL+"/experiments/4/?format=json", "exp_name": "mentored-testbed-demo", "experiment_yaml_file": null,  "display_experiment_yaml_file": null }, { "id": 5, "url": mentored_api.apiURL+"/experiments/5/?format=json", "exp_name": "teste-yaml-upload", "experiment_yaml_file": null,  "display_experiment_yaml_file": null }, { "id": 6, "url": mentored_api.apiURL+"/experiments/6/?format=json", "exp_name": "teste-yaml-upload-2", "experiment_yaml_file": null,  "display_experiment_yaml_file": "Experiment:\n  name: mentored-testbed-demo\n  nodeactors:\n    - name: 'na-server'\n      replicas: 1\n      containers:\n        - name: tcpdump\n          image: ghcr.io/brunomeyer/nginx-server\n          imagePullPolicy: \"Always\"\n          env:\n            - name: TIMEOUT_CMD\n              value: \"300\"\n          command: [\"/app/entry.sh\"]\n          args: [\"python3\", \"save_throughput.py\"]\n          securityContext:\n            privileged: true\n        - name: nginx\n          image: nginx\n          securityContext:\n            privileged: true\n          ports:\n            - containerPort: 80\n          resources:\n            requests:\n              memory: \"1G\"\n              cpu: \"1\"\n            limits:\n              memory: \"2G\"\n              cpu: \"2\"\n      region: 'whx-es'\n    - name: 'na-botnet'\n      replicas: 2\n      containers:\n        - name: botnet\n          image: ghcr.io/brunomeyer/generic-botnet\n          imagePullPolicy: \"Always\"\n          env:\n            - name: PROTOCOL\n              value: \"ICMP\"\n            - name: TIMEOUT_CMD\n              value: \"180\"\n            - name: TIME_WAIT_START\n              value: \"60\"\n            - name: NET_INTERFACE\n              value: ovs-link\n          command: [\"./entry.sh\"]\n          args: [\"hping3\", \"-S\", \"--faster\", \"-p\", \"80\"]\n          securityContext:\n            privileged: true\n          resources:\n            requests:\n              memory: \"64M\"\n              cpu: \"0.5\"\n            limits:\n              memory: \"128M\"\n              cpu: \"1\"\n      region: 'whx-ba'\n    - name: 'na-client'\n      replicas: 3\n      containers:\n        - name: client\n          image: ghcr.io/brunomeyer/generic-client\n          imagePullPolicy: \"Always\"\n          env:\n            - name: TIMEOUT_CMD\n              value: \"300\"\n          command: [\"./entry.sh\"]\n          args: ['python3', 'client_metrics.py']\n          securityContext:\n            privileged: true\n          resources:\n            requests:\n              memory: \"64M\"\n              cpu: \"0.5\"\n            limits:\n              memory: \"128M\"\n              cpu: \"1\"\n      region: 'whx-sp'\n  topology: 'ovs_fully_connected'\n" }];
            setExp_list(d.sort((a, b) => { return b.id - a.id }));
        }
        else {
            mentored_api.get_experiments_definitions(setExp_list, (d) => { cb(d) });

        }
    }
    let get_exec_data = () => {

        if (DEV) {
            let d = [{ "id": 60, "project": 6, "experiment": 4, "status": 2, "execution_time": 300 }, { "id": 59, "project": 6, "experiment": 5, "status": -1, "execution_time": 300 }, { "id": 58, "project": 6, "experiment": 6, "status": 4, "execution_time": 300 }, { "id": 57, "project": 6, "experiment": 4, "status": 4, "execution_time": 300 }, { "id": 56, "project": 6, "experiment": 21, "status": -1, "execution_time": 300 }, { "id": 55, "project": 6, "experiment": 21, "status": -1, "execution_time": 300 }, { "id": 54, "project": 6, "experiment": 21, "status": -1, "execution_time": 300 }, { "id": 53, "project": 6, "experiment": 21, "status": 4, "execution_time": 300 }, { "id": 52, "project": 6, "experiment": 21, "status": 4, "execution_time": 300 }, { "id": 51, "project": 6, "experiment": 21, "status": 4, "execution_time": 300 }, { "id": 50, "project": 6, "experiment": 21, "status": 4, "execution_time": 300 }, { "id": 49, "project": 6, "experiment": 21, "status": 4, "execution_time": 300 }, { "id": 48, "project": 6, "experiment": 20, "status": 4, "execution_time": 300 }, { "id": 47, "project": 6, "experiment": 20, "status": 4, "execution_time": 300 }, { "id": 46, "project": 6, "experiment": 20, "status": 4, "execution_time": 300 }, { "id": 45, "project": 6, "experiment": 20, "status": 4, "execution_time": 300 }, { "id": 44, "project": 6, "experiment": 20, "status": 4, "execution_time": 300 }, { "id": 43, "project": 6, "experiment": 20, "status": 4, "execution_time": 300 }, { "id": 42, "project": 6, "experiment": 20, "status": 4, "execution_time": 300 }, { "id": 41, "project": 6, "experiment": 19, "status": 4, "execution_time": 300 }, { "id": 40, "project": 6, "experiment": 19, "status": 4, "execution_time": 300 }, { "id": 39, "project": 6, "experiment": 19, "status": 4, "execution_time": 300 }, { "id": 38, "project": 6, "experiment": 19, "status": 4, "execution_time": 300 }, { "id": 37, "project": 6, "experiment": 18, "status": -1, "execution_time": 300 }, { "id": 36, "project": 6, "experiment": 17, "status": -1, "execution_time": 300 }, { "id": 35, "project": 6, "experiment": 16, "status": 4, "execution_time": 300 }, { "id": 34, "project": 6, "experiment": 15, "status": 4, "execution_time": 300 }, { "id": 33, "project": 6, "experiment": 14, "status": 4, "execution_time": 300 }, { "id": 32, "project": 6, "experiment": 14, "status": 4, "execution_time": 300 }, { "id": 31, "project": 6, "experiment": 13, "status": 4, "execution_time": 300 }, { "id": 30, "project": 6, "experiment": 13, "status": 4, "execution_time": 300 }, { "id": 29, "project": 6, "experiment": 13, "status": 4, "execution_time": 300 }, { "id": 28, "project": 6, "experiment": 12, "status": 4, "execution_time": 300 }, { "id": 27, "project": 6, "experiment": 12, "status": 4, "execution_time": 300 }, { "id": 26, "project": 6, "experiment": 12, "status": 4, "execution_time": 300 }, { "id": 25, "project": 6, "experiment": 12, "status": 4, "execution_time": 300 }, { "id": 24, "project": 6, "experiment": 12, "status": 4, "execution_time": 300 }, { "id": 23, "project": 6, "experiment": 11, "status": 4, "execution_time": 300 }, { "id": 22, "project": 6, "experiment": 4, "status": -1, "execution_time": 300 }, { "id": 21, "project": 6, "experiment": 10, "status": 4, "execution_time": 300 }, { "id": 20, "project": 1, "experiment": 10, "status": -1, "execution_time": 300 }, { "id": 19, "project": 6, "experiment": 9, "status": -1, "execution_time": 300 }, { "id": 18, "project": 6, "experiment": 4, "status": -1, "execution_time": 300 }, { "id": 17, "project": 1, "experiment": 9, "status": -1, "execution_time": 300 }, { "id": 16, "project": 1, "experiment": 4, "status": -1, "execution_time": 300 }, { "id": 15, "project": 1, "experiment": 9, "status": -1, "execution_time": 300 }, { "id": 14, "project": 1, "experiment": 9, "status": -1, "execution_time": 300 }, { "id": 13, "project": 1, "experiment": 9, "status": -1, "execution_time": 300 }, { "id": 11, "project": 2, "experiment": 4, "status": -1, "execution_time": 300 }, { "id": 9, "project": 1, "experiment": 4, "status": 4, "execution_time": 300 }, { "id": 10, "project": 1, "experiment": 4, "status": 4, "execution_time": 300 }, { "id": 8, "project": 1, "experiment": 4, "status": 4, "execution_time": 300 }];
            setExec_list(d.sort((a, b) => { return b.id - a.id }));
        }
        else {
            mentored_api.get_experiments_executions(setExec_list, (d) => { cb(d) });

        }
    }

    useEffect(() => {
        get_exp_data();
        get_exec_data();
    }, []);



    let total_exp_cards = 4;
    let exp_cards = exp_list.map((x, i) => {
        if (i >= total_exp_cards) return "";
        let cardClassName = "Experiment-card-" + (i + 1).toString();

        return (
            <Card className={' Secondary-card Experiment-card ' + cardClassName}>
                <div className=''>
                    <b>{t('card.experimentID')}</b>: {x.id}<br></br>
                    <b>{t('card.name')}</b>: {x.exp_name}<br></br>
                    <br></br>
                </div>
                <ExperimentDefinitionYAMLView exp={x} />
            </Card>
        );
    });

    let total_exec_cards = 4;
    let exec_cards = exec_list.map((x, i) => {
        if (i >= total_exec_cards) return "";
        let cardClassName = "Execution-card-" + (i + 1).toString();

        let project_name = "Project 1"; // TODO: Fetch correct project name
        let exec_status = "Unknown";

        let x_status_to_str = {
            '-1': "Error",
            '0': "Not initialized",
            '1': "Warmup phase",
            '2': "Warmup phase",
            '3': "Warmup phase",
            '4': "Finished",
        }

        exec_status = x_status_to_str[x.status];

        let monitor_option;
        if (exec_status == "Warmup phase") {
            monitor_option = <ExperimentExecutionMonitor />;
        }
        let exp_name = "";

        for (let j = 0; j < exp_list.length; ++j) {
            if (exp_list[j].id == x.experiment) {
                exp_name = exp_list[j].exp_name;
            }
        }

        return (

            <Card className={'Secondary-card Execution-card ' + cardClassName}>
                <div className=''>
                    <b>{t('card.project')}</b>: {project_name}<br></br>
                    <b>{t('card.experiment')}</b>: {exp_name}<br></br>
                    <b>{t('card.status')}</b>: {exec_status}<br></br>
                </div>
                {monitor_option}
            </Card>
        );
    });

    exec_cards = (<div className='row'>
        {exec_cards}
    </div>)


    exp_cards = (<div className='row'>
        {exp_cards}
    </div>)

    let tutorial_url = mentored_api.baseURL+"/tutorial/";
    let tutorial_url_display = tutorial_url.replace("https://", "");
    tutorial_url_display = tutorial_url_display.replace("http://", "");

    return (
        <div className="container-fluid group mt-5vh">
            <div className='row justify-content-between'>


                <Card className='Tutorial-card Main-card mb-3 ' title={t('card.newstitle')}>
                    {t('card.newstext1')}
                    <br></br>
                    {t('card.newstext2')}
                </Card>

                <Card className='Updates-card Main-card ' title={t('card.tutorialtitle')}>
                    {t('card.tutorialtext')} <a href={tutorial_url}>{tutorial_url_display}</a>.
                </Card>

            </div>
            {exec_cards}
            {exp_cards}
        </div>
    );
}