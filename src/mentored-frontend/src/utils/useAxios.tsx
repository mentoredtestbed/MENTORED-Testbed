import axios from "axios";

let csrfcookie = function() {  // for django csrf protection
  let cookieValue = null,
      name = "csrftoken";
  if (document.cookie && document.cookie !== "") {
      let cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
          let cookie = cookies[i].trim();
          if (cookie.substring(0, name.length + 1) == (name + "=")) {
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
  
  post_new_experiment_definition(selectedFile, exp_name, cb){
    const formData = new FormData();
    formData.append("experiment_yaml_file", selectedFile);
    formData.append("exp_name", exp_name);
    formData.append("csrfmiddlewaretoken", csrfcookie());
    
    const postData = async () => {
      try {
        const response = await axios({
          method: "post",
          url: apiURL+"/experiments/",
          data: formData,
        });
        cb(response.data);
      } catch(error) {
        console.log(error);
      }
    }
    postData();

    return;
  }
  
  post_new_experiment_execution(project_id, experiment_def_id, execution_time, cb){
    const formData = new FormData();
    formData.append("project", project_id);
    formData.append("experiment", experiment_def_id);
    formData.append("execution_time", execution_time);
    formData.append("csrfmiddlewaretoken", csrfcookie());
    
    const postData = async () => {
      try {
        const response = await axios({
          method: "post",
          url: apiURL+"/experimentexecutions/",
          data: formData,
        });
        cb(response.data);
      } catch(error) {
        console.log(error)
      }
    }
    postData();


    return;
  }

  get_experiments_definitions(setRes, cb) {
    const api = useAxios();
    const fetchData = async () => {
     
      const response = await api.get(apiURL + "/experiments/", {
        'csrfmiddlewaretoken': csrfcookie()
      });

      console.log(response);
      console.log(response.data);
      setRes(response.data);
      cb(response.data)
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps

    return;
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
      }
      catch(error) {
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
      }
      catch(error) {
        cb(response);
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
      cb(response.data)
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps

    return;
  }

  get_projects(setRes, cb) {

    const api = useAxios();
    const fetchData = async () => {
      
      const response = await api.get(apiURL+"/projects/", {
        'csrfmiddlewaretoken': csrfcookie()
      });

      console.log(response.data);
      setRes(response.data);
      cb(response.data)
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps

    return;
  }

};

export const mentored_api = new MentoredAPI();

export default useAxios;
