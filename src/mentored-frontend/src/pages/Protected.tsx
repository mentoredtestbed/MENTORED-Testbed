import { useEffect, useState } from "react";
import useAxios from "../utils/useAxios";
import AuthContext, { AuthProvider } from "../context/AuthContext";


const ProtectedPage = () => {
  return (
    <AuthProvider>
      <ProtectedPageCore />
    </AuthProvider>
  );
};
export default ProtectedPage;

interface ExperimentExecution {
  id: number,
  project: number,
  experiment: number,
  status: number,
  execution_time: number,
}

interface ExperimentExecutionProps {
  exps: ExperimentExecution[];
}

export function ProtectedPageCore() {
  const [res, setRes] = useState(0);
  const api = useAxios();

  useEffect(() => {
    const fetchData = async () => {
      // try {
      //   const response = await api.get("/test/");
      //   console.log(api);
      //   setRes(response.data.response);
      // } catch {
      //   setRes("Something went wrong");
      // }
      const response = await api.get("/experimentexecutions/");
      // setRes(response.data.response);
      setRes(JSON.stringify(response.data));
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1>Projected Page</h1>
      <p>{res}</p>
    </div>
  );
}
