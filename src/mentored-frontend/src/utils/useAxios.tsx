import { useContext } from 'react';

import axios from 'axios';
import dayjs from 'dayjs';
import jwt_decode from 'jwt-decode';

import AuthContext from '../context/AuthContext';

const csrfcookie = function () {
  // for django csrf protection
  let cookieValue = null;
  const name = 'csrftoken';
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) == `${name}=`) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};


const baseURL = import.meta.env.VITE_API_BASE_URL;
const apiURL = baseURL+"/api";
const webkubectlURL = import.meta.env.VITE_WEBKUBECTL_URL;

const useAxios = () => {

  const axiosInstance = axios.create({
    apiURL,
  });

  axiosInstance.interceptors.request.use(async req => {
    return req;
  });

  return axiosInstance;
};

class MentoredAPI{
  baseURL = baseURL;
  apiURL = apiURL;
  webkubectlURL = webkubectlURL;

  constructor(){}

  fork_experiment_definition(exp_id, new_project_id, new_exp_name, cb){
    const api = useAxios();
    const formData = new FormData();
    formData.append("exp_id", exp_id);
    formData.append("new_project_id", new_project_id);
    formData.append("new_exp_name", new_exp_name);
    formData.append("csrfmiddlewaretoken", csrfcookie());

    const postData = async () => {
      try {
        const response = await axios({
          method: "post",
          url: `${apiURL}/experiments/${exp_id}/fork/`,
          data: formData,
        });
        cb(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    postData();
  }

  get_cluster_info(setRes, cb){
    // console.log(project_request_data);
    const api = useAxios();
    const getData = async () => {
      try {
        const response = await api.get(
          `${apiURL}/get_cluster_info/`,
            {
              headers: { 'X-CSRFToken' :  csrfcookie()},
              withCredentials: true
            }
        );
        setRes(response.data)
        cb(response.data);
      } catch (error) {
        console.log(error);
        cb(error.response);
      }
    };
    getData();
  }

  check_project_name(project_name, setRes, cb){
    // console.log(project_request_data);
    const api = useAxios();
    const getData = async () => {
      try {
        const response = await api.get(
          `${apiURL}/get_project_with_name/${project_name}/`,
            {
              headers: { 'X-CSRFToken' :  csrfcookie()},
              withCredentials: true
            }
        );
        setRes(response.data)
        cb(response.data);
      } catch (error) {
        console.log(error); 
        cb(error.response);
      }
    };
    getData();
  }

  delete_notification(notification_id, cb){
    const api = useAxios();
    const deleteData = async () => {
      try {
        const response = await api.delete(
          `${apiURL}/notifications/${notification_id}/`,
            {
              headers: { 'X-CSRFToken' :  csrfcookie()},
              withCredentials: true
            }
        );
        cb(response.data);
      } catch (error) {
        console.log(error); 
        cb(error.response);
      }
    };
    deleteData();
    return null;
  }

  edit_read_notification(notification_id, cb){
    const notification_data = {
        "read": true
    }
    // console.log(project_request_data);
    const api = useAxios();
    const patchData = async () => {
      try {
        const response = await api.patch(
          `${apiURL}/notifications/${notification_id}/`, notification_data,
            {
              headers: { 'X-CSRFToken' :  csrfcookie()},
              withCredentials: true
            }
        );
        cb(response);
      } catch (error) {
        console.log(error); 
        cb(error.response);
      }
    };
    patchData();
  }

  get_notifications(setRes, cb){
    // console.log(project_request_data);
    const api = useAxios();
    const getData = async () => {
      try {
        const response = await api.get(
          `${apiURL}/notifications/`,
            {
              headers: { 'X-CSRFToken' :  csrfcookie()},
              withCredentials: true
            }
        );
        setRes(response.data)
        cb(response.data);
      } catch (error) {
        console.log(error); 
        cb(error.response);
      }
    };
    getData();
  }

  post_invite_member(member_info, cb){
    const member_data = {
        "user_email": member_info.user_email,
        "type": "Invite",
        "read": false,
        "project_name": member_info.project_name,
        "project_id": member_info.project_id
    };

    const csrfToken = csrfcookie();
    console.log("TESTE", member_data);
    const postData = async () => {
      try {
        const response = await axios({
          method: "post",
          url: apiURL+`/notifications/`,
          data: member_data,
          headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json'
          },
          withCredentials: true,
        });
        cb(response);
      } catch (error) {
        console.log(error);
        cb(error.response);
      }
    };
    postData();
  }

  get_all_projects_user_role(setRes, cb){
    // console.log(project_request_data);
    const api = useAxios();
    const getData = async () => {
      try {
        const response = await api.get(
          `${apiURL}/get_all_projects_user_role/`,
            {
              headers: { 'X-CSRFToken' :  csrfcookie()},
              withCredentials: true
            }
        );
        setRes(response.data)
        cb(response.data);
      } catch (error) {
        console.log(error); 
        cb(error.response);
      }
    };
    getData();
  }

  edit_current_project_request_status(request_project_data, cb){
    const project_request_data = {
        "current_project_status": request_project_data.current_project_status
    }
    // console.log(project_request_data);
    const api = useAxios();
    const patchData = async () => {
      try {
        const response = await api.patch(
          `${apiURL}/projectrequests/${request_project_data.id}/`, project_request_data,
            {
              headers: { 'X-CSRFToken' :  csrfcookie()},
              withCredentials: true
            }
        );
        cb(response);
      } catch (error) {
        console.log(error); 
        cb(error.response);
      }
    };
    patchData();
  }

  edit_project_is_active(project_is_active, projectId, cb){
    const project_data = {
        "is_active": project_is_active
    }
    // console.log(project_request_data);
    const api = useAxios();
    const patchData = async () => {
      try {
        const response = await api.patch(
          `${apiURL}/projects/${projectId}/`, project_data,
            {
              headers: { 'X-CSRFToken' :  csrfcookie()},
              withCredentials: true
            }
        );
        cb(response);
      } catch (error) {
        console.log(error); 
        cb(error.response);
      }
    };
    patchData();
  }

  remove_project_request(project_request_id, cb){
    const api = useAxios();
    const deleteData = async () => {
      try {
        const response = await api.delete(
          `${apiURL}/projectrequests/${project_request_id}/`,
            {
              headers: { 'X-CSRFToken' :  csrfcookie()},
              withCredentials: true
            }
        );
        cb(response.data);
      } catch (error) {
        console.log(error); 
        cb(error.response);
      }
    };
    deleteData();
    return null;
  }

  post_new_project_request_action_status(request_project_data, cb){
    const formData = new FormData();
    formData.append("user_name", request_project_data.user_name);
    formData.append("user_email", request_project_data.user_email);
    formData.append("user_organization", request_project_data.user_organization);
    formData.append("project_name", request_project_data.project_name);
    formData.append("project_description", request_project_data.project_description);
    formData.append("project_identifier", request_project_data.project_identifier);
    formData.append("project_website", request_project_data.project_website);
    formData.append("project_visibility", request_project_data.project_visibility);
    formData.append("project_resource_x86", request_project_data.project_resource_x86);
    formData.append("project_resource_x86_xlarge", request_project_data.project_resource_x86_xlarge);
    formData.append("project_resource_x86_large", request_project_data.project_resource_x86_large);
    formData.append("project_resource_x86_small", request_project_data.project_resource_x86_small);
    formData.append("project_resource_x86_xsmall", request_project_data.project_resource_x86_xsmall);
    formData.append("project_resource_arm", request_project_data.project_resource_arm);
    formData.append("project_resource_arm_large", request_project_data.project_resource_arm_large);
    formData.append("project_resource_arm_small", request_project_data.project_resource_arm_small);
    formData.append("project_request_subject", request_project_data.project_request_subject);
    formData.append("project_admin_response", request_project_data.project_admin_response);
    formData.append("project_acceptance", request_project_data.project_acceptance);
    formData.append("project_id", request_project_data.project_id);
    formData.append("current_project_status", request_project_data.current_project_status);
    formData.append("csrfmiddlewaretoken", csrfcookie());
    const postData = async () => {
      try {
        const response = await axios({
          method: "post",
          url: apiURL+"/projectrequests/",
          data: formData,
        });
        cb(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    postData();
  }

  edit_admin_response(request_project_data, adminResponse, cb){
    const project_request_data = {
        "project_admin_response": adminResponse
    }
    // console.log(project_request_data);
    const api = useAxios();
    const patchData = async () => {
      try {
        const response = await api.patch(
          `${apiURL}/projectrequests/${request_project_data.id}/`, project_request_data,
            {
              headers: { 'X-CSRFToken' :  csrfcookie()},
              withCredentials: true
            }
        );
        cb(response);
      } catch (error) {
        console.log(error); 
        cb(error.response);
      }
    };
    patchData();
  }

  remove_project_member(userId, projectId, cb){
    const api = useAxios();
    const deleteData = async () => {
      try {
        const response = await api.delete(
          `${apiURL}/projectmembers/${projectId}/${userId}/`,
            {
              headers: { 'X-CSRFToken' :  csrfcookie()},
              withCredentials: true
            }
        );
        cb(response.data);
      } catch (error) {
        console.log(error); 
        cb(error.response);
      }
    };
    deleteData();
    return null;
  }

  edit_project_user_role(roleName, projectId, userEmail, cb){
    const user_data = {
      "role_name": roleName,
      "user_email": userEmail,
    }
    console.log(user_data);
    const api = useAxios();
    const postData = async () => {
      try {
        const response = await api.post(
          `${apiURL}/edit_project_user_role/${projectId}/`, user_data,
            {
              headers: { 'X-CSRFToken' :  csrfcookie()},
              withCredentials: true
            }
        );
        cb(response.data);
      } catch (error) {
        console.log(error); 
        cb(error.response);
      }
    };
    postData();
  }

  get_project_user_role(projectId, setRes, cb){
    // console.log(project_request_data);
    const api = useAxios();
    const getData = async () => {
      try {
        const response = await api.get(
          `${apiURL}/get_project_user_role/${projectId}/`,
            {
              headers: { 'X-CSRFToken' :  csrfcookie()},
              withCredentials: true
            }
        );
        setRes(response.data)
        cb(response.data);
      } catch (error) {
        console.log(error); 
        cb(error.response);
      }
    };
    getData();
  }




  //experiment
  get_experiment_executions(experimentId, setRes, cb){
    // console.log(project_request_data);
    const api = useAxios();
    const getData = async () => {
      try {
        const response = await api.get(
          `${apiURL}/experiment_executions_list/${experimentId}/`,
            {
              headers: { 'X-CSRFToken' :  csrfcookie()},
              withCredentials: true
            }
        );
        setRes(response.data)
        cb(response.data);
      } catch (error) {
        console.log(error); 
        cb(error.response);
      }
    };
    getData();
  }

  get_project_experiments(projectId, setRes, cb){
    // console.log(project_request_data);
    const api = useAxios();
    const getData = async () => {
      try {
        const response = await api.get(
          `${apiURL}/experiments_list/${projectId}/`,
            {
              headers: { 'X-CSRFToken' :  csrfcookie()},
              withCredentials: true
            }
        );
        setRes(response.data)
        cb(response.data);
      } catch (error) {
        console.log(error); 
        cb(error.response);
      }
    };
    getData();
  }

  post_project_member(userEmail, projectId, cb){
    const user_data = {
      "user_email": userEmail
    }
    console.log(user_data);
    const api = useAxios();
    const postData = async () => {
      try {
        const response = await api.post(
          `${apiURL}/projectmembers/${projectId}/`, user_data,
            {
              headers: { 'X-CSRFToken' :  csrfcookie()},
              withCredentials: true
            }
        );
        cb(response);
      } catch (error) {
        console.log(error); 
        cb(error.response);
      }
    };
    postData();
  }

  get_project_members(projectId, setRes, cb){
    // console.log(project_request_data);
    const api = useAxios();
    const getData = async () => {
      try {
        const response = await api.get(
          `${apiURL}/projectmembers/${projectId}/`,
            {
              headers: { 'X-CSRFToken' :  csrfcookie()},
              withCredentials: true
            }
        );
        setRes(response.data)
        cb(response.data);
      } catch (error) {
        console.log(error); 
        cb(error.response);
      }
    };
    getData();
  }

  edit_project_acceptance(request_project_data, cb){
    const project_request_data = {
        "project_acceptance": request_project_data.project_acceptance
    }
    // console.log(project_request_data);
    const api = useAxios();
    const patchData = async () => {
      try {
        const response = await api.patch(
          `${apiURL}/projectrequests/${request_project_data.id}/`, project_request_data,
            {
              headers: { 'X-CSRFToken' :  csrfcookie()},
              withCredentials: true
            }
        );
        cb(response);
      } catch (error) {
        console.log(error); 
        cb(error.response);
      }
    };
    patchData();
  }

  post_new_project(request_project_data, cb){
    const project_data = {
        "users": [],
        "project_name": request_project_data.project_name,
        "namespace_name": "Project_Namespace",
        "kube_config": "Kube Config",
        "is_active": true,
        "project_request": {
          "user_name": request_project_data.user_name,
          "user_email": request_project_data.user_email,
          "user_organization": request_project_data.user_organization,
          "project_name": request_project_data.project_name,
          "project_description": request_project_data.project_description,
          "project_identifier": request_project_data.project_identifier,
          "project_website": request_project_data.project_website,
          "project_visibility": request_project_data.project_visibility,
          "project_resource_x86": request_project_data.project_resource_x86,
          "project_resource_x86_xlarge": request_project_data.project_resource_x86_xlarge,
          "project_resource_x86_large": request_project_data.project_resource_x86_large,
          "project_resource_x86_small": request_project_data.project_resource_x86_small,
          "project_resource_x86_xsmall": request_project_data.project_resource_x86_xsmall,
          "project_resource_arm": request_project_data.project_resource_arm,
          "project_resource_arm_large": request_project_data.project_resource_arm_large,
          "project_resource_arm_small": request_project_data.project_resource_arm_small,
          "project_acceptance": request_project_data.project_acceptance,
          "project_request_subject": request_project_data.project_request_subject,
        }
    };

    const csrfToken = csrfcookie();
    console.log("TESTE", project_data);
    const postData = async () => {
      try {
        const response = await axios({
          method: "post",
          url: apiURL+`/projects/`,
          data: project_data,
          headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json'
          },
          withCredentials: true,
        });
        cb(response);
      } catch (error) {
        console.log(error);
        cb(error.response);
      }
    };
    postData();
  }

  post_new_project_request(request_project_data, cb){
    const formData = new FormData();
    formData.append("user_name", request_project_data.name);
    formData.append("user_email", request_project_data.email);
    formData.append("user_organization", request_project_data.organization);
    formData.append("project_name", request_project_data.projectName);
    formData.append("project_description", request_project_data.projectDescription);
    formData.append("project_identifier", request_project_data.projectID);
    formData.append("project_website", request_project_data.projectWebsite);
    formData.append("project_visibility", request_project_data.projectVisibility);
    formData.append("project_resource_x86", request_project_data.showX86);
    formData.append("project_resource_x86_xlarge", request_project_data.xLargeX86);
    formData.append("project_resource_x86_large", request_project_data.largeX86);
    formData.append("project_resource_x86_small", request_project_data.smallX86);
    formData.append("project_resource_x86_xsmall", request_project_data.xSmallX86);
    formData.append("project_resource_arm", request_project_data.showARM);
    formData.append("project_resource_arm_large", request_project_data.armLarge);
    formData.append("project_resource_arm_small", request_project_data.armSmall);
    formData.append("project_request_subject", 'Creation');
    formData.append("project_acceptance", "Idle");

    formData.append("csrfmiddlewaretoken", csrfcookie());
    const postData = async () => {
      try {
        const response = await axios({
          method: "post",
          url: apiURL+"/projectrequests/",
          data: formData,
        });
        cb(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    postData();
  }

  post_new_experiment_definition(selectedFile, exp_name, project_id, cb){
    const formData = new FormData();
    formData.append("experiment_yaml_file", selectedFile);
    formData.append("exp_name", exp_name);
    formData.append("project", project_id);
    formData.append("csrfmiddlewaretoken", csrfcookie());

    const postData = async () => {
      try {
        const response = await axios({
          method: "post",
          url: apiURL+"/experiments/",
          data: formData,
        });
        cb(response);
      } catch (error) {
        cb(error.response)
      }
    };
    postData();
  }

  post_new_experiment_execution(project_id, experiment_def_id, execution_time, cb) {
    const formData = new FormData();
    formData.append('project', project_id);
    formData.append('experiment', experiment_def_id);
    formData.append('execution_time', execution_time);
    formData.append('csrfmiddlewaretoken', csrfcookie());

    const postData = async () => {
      try {
        const response = await axios({
          method: "post",
          url: apiURL+"/experimentexecutions/",
          data: formData,
        });
        cb(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    postData();
  }

  update_experiment_definition(exp, experiment_text, cb){
    const api = useAxios();
    // Transform experiment_text into a file
    const formData = new FormData();
    formData.append("csrfmiddlewaretoken", csrfcookie());
    formData.append("exp_name", exp.exp_name);
    formData.append("project", exp.project);
    formData.append("user", exp.user);

    // Transform experiment_text into a file
    var blob = new Blob([experiment_text], { type: "text/plain"});
    formData.append("experiment_yaml_file", blob, "experiment.yaml");

    const fetchData = async () => {
      try {
        const response = await api.put(
          apiURL + "/experiments/"+exp.id,
           formData,
           {
             headers: {
              'X-CSRFToken' :  csrfcookie(),
              'Content-Type': `multipart/form-data`,
            },
             withCredentials: true,
           }
        );
        cb(response);
      }
      catch(error) {
        cb(error.response);
      }
    };

    fetchData();
    return null;
  }

  get_experiments_definitions(setRes, cb) {
    const api = useAxios();
    const fetchData = async () => {

      const response = await api.get(apiURL + "/experiments/", {
        'csrfmiddlewaretoken': csrfcookie()
      });

      setRes(response.data);
      cb(response.data);
    };
    fetchData();
  }

  get_experiment_definition(idx, setRes, cb) {
    const api = useAxios();
    const fetchData = async () => {

      const response = await api.get(apiURL + "/experiments/"+idx, {
        'csrfmiddlewaretoken': csrfcookie()
      });

      setRes(response.data);
      cb(response.data);
    };
    fetchData();
  }

  delete_experiment_definition(id, cb) {
    const api = useAxios();

    const fetchData = async () => {
      try {
        const response = await api.delete(
          apiURL + "/experiments/"+id,
            {
              headers: { 'X-CSRFToken' :  csrfcookie()},
              withCredentials: true
            }
        );
        cb(response.data);
      } catch (error) {
        cb(response);
      }
    };

    fetchData();
    return null;
  }

  delete_experiment_execution(id, cb) {
    const api = useAxios();

    const fetchData = async () => {
      try {
        const response = await api.delete(
          apiURL + "/experimentexecutions/"+id,
            {
              headers: { 'X-CSRFToken' :  csrfcookie()},
              withCredentials: true
            }
        );
        cb(response.data);
      } catch (error) {
        cb(error.response);
      }
    };

    fetchData();
    return null;
  }

  get_experiments_executions(setRes, cb) {
    const api = useAxios();
    const fetchData = async () => {

      const response = await api.get(apiURL+"/experimentexecutions/", {
        'csrfmiddlewaretoken': csrfcookie()
      });

      console.log(response.data);
      setRes(response.data);
      cb(response.data);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }

  get_projects(setRes, cb) {
    const api = useAxios();
    const fetchData = async () => {

      const response = await api.get(apiURL+"/projects/", {
        'csrfmiddlewaretoken': csrfcookie()
      });

      // console.log(response.data);
      setRes(response.data);
      cb(response.data);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }

  get_public_projects(setRes, cb) {
    const api = useAxios();
    const fetchData = async () => {

      const response = await api.get(apiURL+"/publicprojects/", {
        'csrfmiddlewaretoken': csrfcookie()
      });

      // console.log(response.data);
      setRes(response.data);
      cb(response.data);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }

  get_requested_projects(setRes, cb) {
    const api = useAxios();
    const fetchData = async () => {

      const response = await api.get(apiURL+"/projectrequests/", {
        'csrfmiddlewaretoken': csrfcookie()
      });

      console.log(response.data);
      setRes(response.data);
      cb(response.data);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }

  get_requested_project(id, cb) {
    const api = useAxios();
    const fetchData = async () => {

      const response = await api.get(apiURL+`/projectrequests/${id}/`, {
        'csrfmiddlewaretoken': csrfcookie()
      });

      console.log(response.data);
      // setRes(response.data);
      cb(response.data);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }

  get_running_pods(setRes, cb, ee_id) {
    const api = useAxios();
    const fetchData = async () => {

      const response = await api.get(apiURL+"/get_running_pods/"+ee_id, {
        'csrfmiddlewaretoken': csrfcookie()
      });

      setRes(response.data);
      cb(response.data)
    };
    fetchData();
    return;
  }

  get_webkubectl_token(setRes, cb) {
    const api = useAxios();
    const fetchData = async () => {

      const response = await api.get(apiURL+"/get_webkubectl_token/", {
        'csrfmiddlewaretoken': csrfcookie()
      });

      setRes(response.data);
      cb(response.data)
    };
    fetchData();
    return;
  }

};

export const mentored_api = new MentoredAPI();

export default useAxios;
