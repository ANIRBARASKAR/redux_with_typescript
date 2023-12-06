import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import workSpaceImg from "../assets/img/workspace-photo.svg";
import { SERVER_BASE_URL } from "../constants/urles";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Workspace from "./Workspace";
import { workspaceType } from "../stateManagement/actions/useAction";
interface WorkspaceDataInterface {
  createdAt: string;
  description: string;
  id: number;
  name: string;
  purpose: string;
  type: string;
  updatedAt: string;
  userId: number;
  imageUrl:string;
}
const Home: React.FC = () => {
  const {token} = useSelector((state:any) => state.userToken)
  const [workSpaceData, setworkSpaceData] = useState<WorkspaceDataInterface>({
    createdAt: "",
    description: "",
    id: 0,
    name: "",
    purpose: "",
    type: "",
    updatedAt: "",
    userId: 0,
    imageUrl:workSpaceImg
  })
  const dispatch = useDispatch()
  const {id} = useParams()
  const handleFetchWorkSpaceList = async () =>{
    try {
      const response = await fetch(`${SERVER_BASE_URL}/workspaces/${id}`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      const workSpace = await response.json();
      if (!response.ok) {
        console.error("Fetching Data failed:", workSpace || response);
        return;
      }
      console.log(workSpace.data)
      setworkSpaceData(workSpace.data)
      dispatch(workspaceType(workSpace.data.type))
    } catch (error) {
      console.error("Error during Fetch Data:", error);
    }
  }

  useEffect(() => {
    handleFetchWorkSpaceList()
  }, [])
  return (
    <>
      <Navbar />
      <div className="workspace-wrap">
        <div className="workspace-inner">
          <div className="workspace-img">
            <img src={workSpaceData?.imageUrl ? `${workSpaceData?.imageUrl}` : workSpaceImg} alt="" />
          </div>
          <div className="workspace-con">
            <h1 className="workspace-title">Welcome to {workSpaceData?.name}</h1>
            <p>
              {workSpaceData?.description}
            </p>
            <div className="workspace-info">
              <p>
              For inquiries related to this Workspace, reach out to the provided email and phone number
              </p>
              <a href="mailto:Tushar@xyz.com">Tushar@xyz.com</a>
              <a href="tel:0470309719">0470309719</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
