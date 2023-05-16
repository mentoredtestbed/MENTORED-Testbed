import axios from "axios";
import jwt_decode from "jwt-decode";
import dayjs from "dayjs";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";


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


// const baseURL = "http://127.0.0.1:8000/api";
const baseURL = "https://mentored-testbed.cafeexpresso.rnp.br/api";

const useAxios = () => {
  // const { authTokens, setUser, setAuthTokens } = useContext(AuthContext);

  const axiosInstance = axios.create({
    baseURL,
    // headers: { Authorization: `Bearer ${authTokens?.access}` }
  });

  axiosInstance.interceptors.request.use(async req => {
    // const user = jwt_decode(authTokens.access);
    // const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

    // if (!isExpired) return req;

    // const response = await axios.post(`${baseURL}/api/token/refresh/`, {
    //   refresh: authTokens.refresh
    // });

    // localStorage.setItem("authTokens", JSON.stringify(response.data));

    // setAuthTokens(response.data);
    // setUser(jwt_decode(response.data.access));

    // req.headers.Authorization = `Bearer ${response.data.access}`;
    return req;
  });

  return axiosInstance;
};

class MentoredAPI{

  constructor(){
  }
  
  post_new_experiment_definition(selectedFile, exp_name, cb){
    const formData = new FormData();
    formData.append("experiment_yaml_file", selectedFile);
    formData.append("exp_name", exp_name);
    formData.append("csrfmiddlewaretoken", csrfcookie());
    
    const postData = async () => {
      try {
        // const response = await axios({
        const response = await axios({
          method: "post",
          url: "https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/",
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
  
  post_new_experiment_execution(project_id, experiment_def_id, execution_time, cb){
    const formData = new FormData();
    formData.append("project", project_id);
    formData.append("experiment", experiment_def_id);
    formData.append("execution_time", execution_time);
    formData.append("csrfmiddlewaretoken", csrfcookie());
    
    const postData = async () => {
      try {
        // const response = await axios({
        const response = await axios({
          method: "post",
          url: "https://mentored-testbed.cafeexpresso.rnp.br/api/experimentexecutions/",
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

  // get_experiment_definition(set_respone){
  //   const formData = new FormData();
  //   formData.append("csrfmiddlewaretoken", csrfcookie());
    
  //   try {
  //     // const response = await axios({
  //     const response = axios({
  //       method: "get",
  //       url: "https://mentored-testbed.cafeexpresso.rnp.br/api/experiments/",
  //       data: formData,
  //     });
  //     set_respone(response);
  //   } catch(error) {
  //     console.log(error)
  //   }

  //   return;
  // }

  
  get_experiments_definitions(setRes, cb) {
    const api = useAxios();
    const fetchData = async () => {
      // try {
      //   const response = await api.get("/test/");
      //   console.log(api);
      //   setRes(response.data.response);
      // } catch {
      //   setRes("Something went wrong");
      // }
      const response = await api.get(baseURL + "/experiments/", {
        'csrfmiddlewaretoken': csrfcookie()
      });

      // setRes(response.data.response);
      // setRes(JSON.parse(response.data));
      console.log(response.data);
      setRes(response.data);
      cb(response.data)
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps

    return;
  }

  get_experiments_executions(setRes, cb) {
    const api = useAxios();
    const fetchData = async () => {
      // try {
      //   const response = await api.get("/test/");
      //   console.log(api);
      //   setRes(response.data.response);
      // } catch {
      //   setRes("Something went wrong");
      // }
      const response = await api.get(baseURL+"/experimentexecutions/", {
        'csrfmiddlewaretoken': csrfcookie()
      });

      // setRes(response.data.response);
      // setRes(JSON.parse(response.data));
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
      // try {
      //   const response = await api.get("/test/");
      //   console.log(api);
      //   setRes(response.data.response);
      // } catch {
      //   setRes("Something went wrong");
      // }
      const response = await api.get(baseURL+"/projects/", {
        'csrfmiddlewaretoken': csrfcookie()
      });

      // setRes(response.data.response);
      // setRes(JSON.parse(response.data));
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