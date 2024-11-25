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
        mentored_api.get_experiments_definitions(setExp_list, (d) => { });
    }
    let get_exec_data = () => {
        mentored_api.get_experiments_executions(setExec_list, (d) => { });
    }

    useEffect(() => {
        const isLogged = localStorage.getItem('logged');
        const loginData = localStorage.getItem('login_data');

        // Fazer algo com as informações da sessão
        console.log('Is Logged:', isLogged);
        if(loginData){
            console.log('Login Data:', JSON.parse(loginData));
        }
        
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