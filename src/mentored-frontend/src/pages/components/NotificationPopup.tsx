import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IoNotificationsCircleOutline } from "react-icons/io5";
import '../../assets/css/NotificationPopup.css';
import { mentored_api } from "../../utils/useAxios";
import { Dropdown } from 'react-bootstrap';

import {
    TextField,
    Checkbox,
    FormControlLabel,
    Select,
    MenuItem,
    Link,
    Button,
    CircularProgress,
} from '@material-ui/core';

interface InviteNotificationContent {
    id: number;
    project_name: string;
    project_id: number;
    user_email: string;
    notification: number;
}

interface SystemNotificationContent {
    id: number;
    message: string;
    message_timer: string;
    message_sender: string;
    notification: number;
}

export interface NotificationContent {
    id: number;
    user: number;
    type: 'Invite' | 'System';
    created_at: string;
    read: boolean;
    invite_notification?: InviteNotificationContent;
    system_notification?: SystemNotificationContent;
}

interface Props {
    notifications: NotificationContent[];
    notificationCount: number;
}


const NotificationPopup: React.FC<Props> = ({ notifications, notificationCount}) => {

    const { t } = useTranslation();

    const handleInvitationAccept = (notification: NotificationContent) => {
        if(notification.invite_notification?.project_id && notification.invite_notification?.user_email){
            mentored_api.post_project_member(notification.invite_notification?.user_email, notification.invite_notification?.project_id,  (response) => {
                if(response.status == 200){
                    mentored_api.delete_notification(notification.id, (responseDelete) => {
                        window.location.reload(false);
                    });
                }
            });
        }
    }

    const handleInvitationReject = (notification: NotificationContent) => {
        mentored_api.delete_notification(notification.id, (response) => {});
    }

    const handleNotificationAlert = () => {
        notificationCount = 0;
        try {
            for (const notification of notifications) {
                if (notification.read === false) {
                    mentored_api.edit_read_notification(notification.id, (response) => {});
                }
            }
        } catch (error) {
            console.error('Error processing notifications:', error);
        }
    }

    const handleNoNotifications = () => {
        return (
            <Dropdown.Item className='dropdown-item'>
                <div className='col-auto'>
                    <div className='msg-info'>
                        <p className='msgcontent'>{t('header.noNotifications') as string}</p>
                    </div>
                </div>
            </Dropdown.Item>
        )
    }

    const handleInviteNotifications = (notification: NotificationContent) => {
        return (
            <Dropdown.Item className='dropdown-item'>
                <div className='col-auto'>
                    <div className='msg-info'>
                        <p className='msgcontent'>{t('header.inviteMsg') as string + notification.invite_notification?.project_name + '.'}</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
                        <Button
                        variant="contained"
                        onClick={() => {handleInvitationAccept(notification)}}
                        className={`buttonPersonalizationRequest`}
                        style={{ backgroundColor: "#103559"}}
                        onMouseDown={e => e.preventDefault()}
                        >
                            {t('newrequest.accept') as string}
                        </Button>
                        <Button
                        variant="contained"
                        onClick={() => {handleInvitationReject(notification)}}
                        className={`buttonPersonalizationRequest`}
                        style={{ backgroundColor: "#103559" }}
                        onMouseDown={e => e.preventDefault()}
                        >
                            {t('newrequest.reject') as string}
                        </Button>
                    </div>
                </div>
            </Dropdown.Item>
        )
    }

    const handleTextNotifications = (notification: NotificationContent) => {
        return (
            <Dropdown.Item>
                <div className='col-auto'>
                    <div className='msg-info'>
                        <p className='msgcontent'>{notification.system_notification?.message}</p>
                        <p className='msgtime'>{notification.system_notification?.message_timer}</p>
                        <p className='msgsender'>{notification.system_notification?.message_sender}</p>
                    </div>
                </div>
            </Dropdown.Item>
        )
    }

    return (
        <Dropdown align="start" className="dropdown dropleft notification-icon-wrapper" onClick={handleNotificationAlert}>
            <Dropdown.Toggle
                as={IoNotificationsCircleOutline}
                id="dropdownMenuButton"
                role="button"
                className="notification-iconStyle"
            >
            </Dropdown.Toggle>
            {notificationCount > 0 && (
                <span className="notification-count">{notificationCount}</span>
            )}
            <Dropdown.Menu className="dropdown-menu text-center navcolor" align="start">
                <div className='container-fluid dropmsg'>
                    {notifications.length ? 
                        notifications.map((notification, index) => (
                        <div className='row msg-container' key={index}>
                            {notification.type === 'Invite' 
                            ? handleInviteNotifications(notification)
                            : handleTextNotifications(notification)
                            }
                        </div>
                        ))
                    :
                        <div className='row msg-container'>
                        {handleNoNotifications()}
                        </div>
                    }
                </div>
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default NotificationPopup;