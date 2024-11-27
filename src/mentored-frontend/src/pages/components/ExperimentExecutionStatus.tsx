import React, { useState, useEffect} from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { RiCheckboxBlankCircleFill } from "react-icons/ri";
import ProgressBar from './ProgressBar';
import '../../assets/css/ExperimentExecutionStatus.css';
import { useTranslation } from 'react-i18next';

interface Props {
    row: any;
}


const ExperimentExecutionStatus: React.FC<Props> = ({ row }) => {
    
    let status = row.status;
    const { t } = useTranslation();

    const renderTooltip = (props: any) => {
        return (
            <Tooltip id="status-tooltip" {...props}>
                <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    {status === -1 && "Status -1"}
                    {status === 1 && "Status 1"}
                    {status === 2 && "Status 2"}
                    {status === 3 && "Status 3"}
                    {status === 4 && "Status 4"}
                </div>
                <div style={{ textAlign: 'center' }}>
                    {status === -1 && t('experimentexecutionstatus.statusminus1')}
                    {status === 1 && t('experimentexecutionstatus.status1')}
                    {status === 2 && t('experimentexecutionstatus.status2')}
                    {status === 3 && `${t('experimentexecutionstatus.status3')}: ${row.progress}%`}
                    {status === 4 && t('experimentexecutionstatus.status4')}
                </div>
            </Tooltip>
        );
    }

    return (
        <div className="row text-center">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                {status === -1 || status === 1 || status === 2 || status === 4 ?
                    <OverlayTrigger
                        placement="left"
                        delay={{ show: 250, hide: 400 }}
                        overlay={renderTooltip}
                    >
                        <div>
                            {(status === -1 || status === 2 || status === 4) && <RiCheckboxBlankCircleFill className='table-icons' style={{ color: status === -1 ? 'gray' : status === 4 ? 'green' : 'orange' }} />}
                            {status == 1 && <span style={{ color: 'yellow', textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}> Warming up </span>}
                        </div>
                    </OverlayTrigger>
                : status === 3 ?
                <OverlayTrigger
                    placement="left"
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderTooltip}
                >
                    <div>
                        <ProgressBar 
                            width="80px" 
                            height='8px'
                            showButton={false}
                            showPercentage={false}
                            reloadTime={0}
                            initialProgress={row.progress}
                        />
                    </div>
                </OverlayTrigger>
                : null}
            </div>
        </div>
    );
}

export default ExperimentExecutionStatus;