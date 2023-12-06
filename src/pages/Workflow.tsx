import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import avatarImg from "../assets/img/avatar.jpg";
import Select from "../components/Select";
import Modal from "../components/Modal";
import { DatePicker } from "antd";
import { WorkflowTeamAdd } from "../components/WorkFlowTeam/WorkFlowTeam";
import { SERVER_BASE_URL } from "../constants/urles";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import moment, { isDate } from "moment";
import dayjs, { Dayjs } from "dayjs";
import UserSelect from "../components/UserSelect";
import AlertModal from "../components/Alert";
import * as XLSX from 'xlsx';
import DynamicSelect from "../components/DynamicSelect";
import UseUserTeamInfo from "../components/FetchRoleAndTeam";
import PageLoader from "../components/PageLoader";
interface WorkflowProps {}
interface taskInfoInter {
  name:string
}
interface User {
  firstName: string;
  lastName: string;
}
interface Participant {
  participates: any;
  id: number;
  userId: number | null;
  email: string;
  roleId: number | null;
  isInvited: boolean;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  roles: any[]; // You may want to define a proper type for roles
}
interface Task {
  id: number;
  name: string;
  workspaceId: number;
  dueDate: string | null;
  userId: number;
  teamId: number | null;
  allocate: number | null;
  taskNum: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  participates: any; // You may want to define a proper type for participates
}

interface ApiResponse {
  name: string;
  data: Task[];
}

interface selectInter {
  value:number;
  label:string
}
interface teamsInterface {
  createdAt: string,
  id: number,
  name: string,
  updatedAt: string,
  workspaceId: number
}
const Workflow: React.FC<WorkflowProps> = () => {
  const [selectedTeam, setSelectedTeam] = useState<number>(0);
  const [workflos, setworkflos] = useState<Task[]>([])
  const [filteredWorkflows, setfilteredWorkflows] = useState<Task[]>([])
  const [selectedParticipents, setSelectedParticipents] = useState<number>(0);
  const [updateId, setupdateId] = useState<number>(0)
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [showTeamAddModal, setShowTeamAddModal] = useState<boolean>(false);
  const [selectedDate, setselectedDate] = useState<string>('')
  const [alertShow, setalertShow] = useState<boolean>(false)
  const [loading, setloading] = useState<boolean>(true)
  const [allParticipants, setAllParticipants] = useState<selectInter[]>([])
  const [teamsList, setteamsList] = useState<teamsInterface[]>([])
  const [message, setmessage] = useState<string>('')
  const [typeOfAlert, settypeOfAlert] = useState<string>('')
  const [taskInfo, settaskInfo] = useState<taskInfoInter>({
    name:''
  })
  const {token} = useSelector((state:any) => state.userToken)
  const { userId } = useSelector((state: any) => state.userid)
  const params = useParams()
  const userTeamInfo =  UseUserTeamInfo(userId);
  const hasSuperAdminAdminAndQAPermission = [1, 2, 3].includes(Number(userTeamInfo.roleName));
  const hasSuperAdminPermission = [1].includes(Number(userTeamInfo.roleName))
  const hasADminPermission = [2].includes(Number(userTeamInfo.roleName))
  const hasQAPermission = [3].includes(Number(userTeamInfo.roleName))

  const [showInviteTeamModal, setShowInviteTeamModal] =
    useState<boolean>(false);

    const handleShowDelete = () =>{
      if(hasSuperAdminPermission){
        return true;
      }
    }
    const [selectedRows, setSelectedRows] = useState<number[]>([]);

    
    const handleCheckboxChange = (taskId: number) => {
      setSelectedRows((prevSelectedRows) => {
        if (prevSelectedRows.includes(taskId)) {
          return prevSelectedRows.filter((id) => id !== taskId);
        } else {
          return [...prevSelectedRows, taskId];
        }
      });
    };
  
    const downloadExcel = () => {
      if(selectedRows.length <= 0){
        setmessage("Please Select Rows to download")
        settypeOfAlert("error")
        setalertShow(true)
        return
      }
      const selectedTasks = workflos.filter((workflow) => selectedRows.includes(workflow.id));
      const ws = XLSX.utils.json_to_sheet(selectedTasks);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'SelectedTasks');
      XLSX.writeFile(wb, 'selectedTasks.xlsx');
    };
    const handleFetchWorkFlows = async ():Promise<void> =>{
      try {
        const response = await fetch(`${SERVER_BASE_URL}/workflows`, {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json",
            "workspaceid":`${params.id}`
          }
        });
    
        const workflow = await response.json();
        if (!response.ok) {
          setloading(false)
          setmessage(workflow.error)
          settypeOfAlert("error")
          setalertShow(true)
          return;
        }
        setworkflos(workflow.data)
        setfilteredWorkflows(workflow.data)
        setloading(false)
      } catch (error) {
        setloading(false)
        console.error("Error during Task Creating:", error);
      }
    }
    const handleFetchTeams = async (): Promise<void> => {
      try {
        const response = await fetch(`${SERVER_BASE_URL}/teams`, {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json",
            "workspaceid": `${params.id}`
          }
        });
  
        const teamsData = await response.json();
        if (!response.ok) {
          console.error("fetch failed:", teamsData || response);
          return;
        }
        console.log(teamsData)
        setteamsList(teamsData?.data)
        setSelectedTeam(teamsData.data[0])
      } catch (error) {
        console.error("Error during fetch teams:", error);
      }
    }
    const handleFetchParticipates = async ():Promise<void> =>{
      try {
        const response = await fetch(`${SERVER_BASE_URL}/teams/participate`, {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json",
            "workspaceid":`${params.id}`
          }
        });
    
        const participate = await response.json();
        if (!response.ok) {
          setmessage(participate.error)
          settypeOfAlert("error")
          setalertShow(true)
          return;
        }

        const participants: Participant[] = participate.data.flatMap((team: Participant) => team.participates);

        const filteredParticipants = participants.filter(participant =>
          participant.user?.firstName !== undefined && participant.user?.lastName !== undefined
        );
        
        const mappedParticipants = filteredParticipants.map(participant => ({
          value: participant.id,
          label: `${participant.user?.firstName} ${participant.user?.lastName}`,
        }));
    setAllParticipants(mappedParticipants)
      } catch (error) {
        console.error("Error during Task Creating:", error);
      }
    }

    const handleSetDueDate = async (id: number, date: string): Promise<void> => {
      try {
        const parameter = {
          dueDate: date,
        };
    
        const response = await fetch(`${SERVER_BASE_URL}/workflows/duedate/${id}`, {
          method: "PUT",
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json",
            "workspaceid": `${params.id}`,
          },
          body: JSON.stringify(parameter)
        });
    
        const workflow = await response.json();
        
        if (!response.ok) {
          setmessage(workflow.error);
          settypeOfAlert("error");
          setalertShow(true);
          return;
        }
    
        handleFetchWorkFlows()
        setShowInviteTeamModal(false)
        setmessage("due date changed successfully....!")
        settypeOfAlert("success")
        setalertShow(true)
      } catch (error) {
        console.error("Error during Task Creating:", error);
      }
    };
    const handleDelete = async (id: number): Promise<void> => {
      try {    
        const response = await fetch(`${SERVER_BASE_URL}/workflows/${id}`, {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json",
            "workspaceid": `${params.id}`,
          }
        });
    
        const workflow = await response.json();
        
        if (!response.ok) {
          setmessage(workflow.error);
          settypeOfAlert("error");
          setalertShow(true);
          return;
        }
        setmessage("Task Deleted Successfully...")
        settypeOfAlert('success')
        setalertShow(true)
        handleFetchWorkFlows()
      } catch (error) {
        console.error("Error during Task Creating:", error);
      }
    };
    const handleEditWorkFlow = async (): Promise<void> => {
      try {
        const parameter = {
          allocate: selectedParticipents,
          status:selectedStatus
        };
    
        const response = await fetch(`${SERVER_BASE_URL}/workflows/${updateId}`, {
          method: "PUT",
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json",
            "workspaceid": `${params.id}`,
          },
          body: JSON.stringify(parameter)
        });
    
        const workflow = await response.json();
        
        if (!response.ok) {
          setmessage(workflow.error);
          settypeOfAlert("error");
          setalertShow(true);
          setShowInviteTeamModal(false) 
          return;
        }
        setmessage("Task Update Successfully...")
        settypeOfAlert("success")
        setalertShow(true)
        setShowInviteTeamModal(false) 
        handleFetchWorkFlows()
      } catch (error) {
        console.error("Error during Task Creating:", error);
      }
    };
    
    const handleDueDateChange = async (id: number, date: Dayjs | null): Promise<void> => {
      if (date) {
        const formattedDate = date.format("YYYY-MM-DD");
        try {
          await handleSetDueDate(id, formattedDate);
        } catch (error) {
          console.error("Error setting due date:", error);
        }
      }
    };
    
    const handleFilterStatus = (status:string) =>{
      if(status){
      const statusMatch = filteredWorkflows.filter((workflow) => workflow.status === status)
      setfilteredWorkflows(statusMatch)
      }else{
        setfilteredWorkflows(workflos)
      }
    }

    const handleFilterDueDate = (date:string) =>{
      if(date){
      const dueDateMatch = filteredWorkflows.filter((workflow:Task) => workflow.dueDate === date)
      setfilteredWorkflows(dueDateMatch)
      }else{
        setfilteredWorkflows(workflos)
      }
    }

    const handleFilterTeam = (id:number) =>{
      if(id){
      const teamidMatch = filteredWorkflows.filter((workflow:Task) => workflow.teamId === id)
      setfilteredWorkflows(teamidMatch)
      }else{
        setfilteredWorkflows(workflos)
      }
    }


useEffect(() => {
  handleFetchWorkFlows()
  handleFetchParticipates()
  handleFetchTeams()
}, [])

  return (
    <>
      <Navbar />
      <div className="top-action-bar style-2 d-sm-flex flex-wrap align-items-center">
        <div className="d-flex align-items-center gap-5">
          {
            hasSuperAdminAdminAndQAPermission && <button type="button" className="part-team-add-btn__v2" onClick={() => setShowTeamAddModal(true)}>
            <span>
              <i className="icon-plus"></i>
            </span>
            Add Task
          </button>
          }
          
          <button type="button" className="btn btn-dark" onClick={downloadExcel}>
            Download
          </button>
        </div>
        <div className="flex-fill task-filters d-flex flex-wrap justify-content-sm-end">
          <div className="form-group">
            <label htmlFor="" className="form-label">
              Status
            </label>
            <Select
              placeholder="Status"
              options={[
                { value: 1, label: "Pending" },
                { value: 2, label: "In Process" },
                { value: 2, label: "Complete" },
              ]}
              onChange={(e) => handleFilterStatus(e)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="" className="form-label">
              Due Date
            </label>
            {/* <select name="" id="" className="form-select"> */}
              <DatePicker className="form-select" onChange={(date) => handleFilterDueDate(date ? date.format('YYYY-MM-DD') : '')}/>
            {/* </select> */}
          </div>
          <div className="form-group">
            <label htmlFor="" className="form-label">
              Team 
            </label>
            <DynamicSelect
                // placeholder="Team"
                options={teamsList}
                defaultValue={selectedTeam}
                onChange={(e) => handleFilterTeam(e)}
              />
          </div>
        </div>
      </div>
      {
        loading  ? <PageLoader/> : <div className="inner-scroller task-page">
        <div className="table-responsive">
          <table className="task-table table">
            <thead>
              <tr>
                <th>
                  <div className="form-check d-flex align-items-center mb-0">
                    {/* <input
                      className="form-check-input"
                      type="checkbox"
                      id="name1"
                    /> */}
                    <label className="form-check-label" htmlFor="name1">
                      Task
                    </label>
                  </div>
                </th>
                <th className="text-center">Task No</th>
                <th className="text-center">Date Created</th>
                <th className="text-center">Due Date</th>
                <th className="text-center">Created By</th>
                <th className="text-center">Status</th>
                <th className="text-center">Allocate</th>
                <th className="text-center">Team</th>
                <th className="empty-cell"></th>
              </tr>
            </thead>
            <tbody>
              {
                filteredWorkflows && filteredWorkflows.length > 0 ? filteredWorkflows.map((workflow:Task) => (
                  <tr key={workflow.id}>
                <td>
                  <div className="form-check d-flex align-items-center mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="name3"
                      onChange={() => handleCheckboxChange(workflow.id)}
                    />
                    <label
                      className="form-check-label text-black"
                      htmlFor="name3"
                    >
                      {workflow.name}
                    </label>
                  </div>
                </td>
                <td className="text-center">{workflow.taskNum}</td>
                <td className="text-black text-center">{moment(workflow.createdAt).format('MMMM D, YYYY')}</td>
                <td className="text-center">
                {
                  workflow.dueDate  != null ? workflow.dueDate : <DatePicker disabled={!hasSuperAdminAdminAndQAPermission}
                  bordered={false}
                  placeholder="+ Set Due Date"
                  onChange={(date) => handleDueDateChange(workflow.id, date)}
                />
                }
                </td>
                <td className="text-center">{workflow.user.firstName}</td>
                <td className="text-center">
                  <span className={`task-status ${workflow.status}`}>{workflow.status}</span>
                </td>
                <td>
                {
                     workflow.participates != null &&   <div className="team-user-wrap">
                    <div className="team-user-img">
                      <img src={ workflow.participates?.user.imageUrl} alt="" />
                    </div>
                     <div className="team-user-con">
                      <span>{ workflow.participates?.user.firstName} { workflow.participates?.user.lastName}</span>
                      <a href="mailto:candice@untitledui.com">
                        { workflow.participates?.user.email}
                      </a>
                    </div>
                  </div>
                    }
                </td>
                <td className="text-center">{workflow?.participates?.teams.name}</td>
                <td className="text-start">
                  <button type="button" className="td-icon-btn" disabled={!hasSuperAdminAdminAndQAPermission} onClick={() => handleDelete(workflow.id)}>
                    <i className="icon-trash"></i>
                  </button>
                  <button
                    type="button"
                    className="td-icon-btn"
                    disabled={!hasSuperAdminAdminAndQAPermission}
                    onClick={() => {setShowInviteTeamModal(true); setupdateId(workflow.id)}}
                  >
                    <i className="icon-edit"></i>
                  </button>
                </td>
              </tr>
                )) : null
              }
            </tbody>
          </table>
        </div>
      </div>
      }
      <Modal
        show={showInviteTeamModal}
        onSave={handleEditWorkFlow}
        onSaveBtnText="Allocate"
        onCancel={() => setShowInviteTeamModal(false)}
      >
        <div className="modal-icon mx-auto">
          <i className="icon-user-plus"></i>
        </div>
        <h5 className="modal-title">Allocate to Participent</h5>
        <div className="form-group">
          <label htmlFor="" className="form-label color-2">
            Participant 
          </label>
          <UserSelect
            placeholder="Participant"
            options={allParticipants}
            onChange={(e) => setSelectedParticipents(e)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="" className="form-label color-2">
            Status
          </label>
          <Select
            placeholder="Status"
            options={[
              { value: 1, label: "Pending" },
              { value: 2, label: "In Process" },
              { value: 2, label: "Complete" },
            ]}
            onChange={(e) => setSelectedStatus(e)}
          />
        </div>
        <div className="col-12 my-2">
            <div className="form-input">
              <label htmlFor="" className="form-label">
                Due Date
              </label>
              <DatePicker onChange={(date) => handleDueDateChange(updateId,date)} placeholder="2023-11-28" />
            </div>
          </div>
      </Modal>
      <WorkflowTeamAdd setmessage={setmessage} handleFetchWorkFlows={handleFetchWorkFlows} setalertShow={setalertShow} settypeOfAlert={settypeOfAlert}show={showTeamAddModal} setShow={setShowTeamAddModal} />
      <AlertModal setShow={setalertShow} show={alertShow} msg={message} type={typeOfAlert}/>
    </>
  );
};

export default Workflow;
