import { Modal } from "react-bootstrap";
import React, { ChangeEvent, useState } from "react";
import Select from "../Select";
import { DatePicker } from "antd";
import { useSelector } from "react-redux";
import { SERVER_BASE_URL } from "../../constants/urles";
import { useParams } from "react-router-dom";
interface taskinfo {
  name:string
}
interface WorkflowTeamProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setalertShow:React.Dispatch<React.SetStateAction<boolean>>;
  settypeOfAlert:React.Dispatch<React.SetStateAction<string>>;
  setmessage:React.Dispatch<React.SetStateAction<string>>;
  handleFetchWorkFlows:() => Promise<void>;
}
interface taskInfoInter {
  name:string
}
export function WorkflowTeamAdd({ show, setShow,handleFetchWorkFlows,setmessage,settypeOfAlert,setalertShow}: WorkflowTeamProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [taskInfo, settaskInfo] = useState<taskInfoInter>({
    name:''
  })
  const [selectedParticipant, setSelectedParticipant] = useState<string>("");
  const onChange = (date: any, dateString: string) => {
    console.log(date, dateString);
  };
  const params = useParams()
  const {token} = useSelector((state:any) => state.userToken)
    const handleCreateworkFlows = async (e: React.FormEvent<HTMLFormElement>):Promise<void> =>{
      try {
        e.preventDefault()
        const response = await fetch(`${SERVER_BASE_URL}/workflows`, {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json",
            "workspaceid" : `${params.id}`
          },
          body: JSON.stringify(taskInfo),
        });
    
        const workSpace = await response.json();
        if (!response.ok) {
          setmessage(workSpace.error)
          settypeOfAlert("error")
          setalertShow(true)
          setShow(false)
          return;
        }
        setmessage("WorkFlows Created Successfully...!")
        settypeOfAlert("success")
        setalertShow(true)
        setShow(false)
        handleFetchWorkFlows()
      } catch (error) {
        console.error("Error during Task Creating:", error);
      }
    }
  return (
    <Modal centered show={show} onHide={() => setShow(false)}>
      <Modal.Body>
        <form className="row gy-3" onSubmit={handleCreateworkFlows}>
          <div className="col-12">
            <div className="modal-icon mx-auto">
              <i className="icon-user-plus"></i>
            </div>
          </div>
          <div className="col-12">
            <div className="form-input">
              <label htmlFor="" className="form-label">
                Add Task
              </label>
              <textarea name="" id="" onChange={(e:ChangeEvent<HTMLTextAreaElement>) => settaskInfo({...taskInfo,name:e.target.value})}></textarea>
            </div>
          </div>
          
          <div className="col-12">
            <div className="row gy-3 gx-2">
              <div className="col-12 col-sm-6">
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100"
                  onClick={() => setShow(false)}
                >
                  Cancel
                </button>
              </div>
              <div className="col-12 col-sm-6">
                <button type="submit" className="btn btn-dark w-100">
                  Create
                </button>
              </div>
            </div>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}

export function WorkflowTeamEdit({ show, setShow }: WorkflowTeamProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedParticipant, setSelectedParticipant] = useState<string>("");
  const onChange = (date: any, dateString: string) => {
    console.log(date, dateString);
  };

  return (
    <Modal centered show={show} onHide={() => setShow(false)}>
      <Modal.Body>
        <form className="row gy-3">
          <div className="col-12">
            <div className="modal-icon mx-auto">
              <i className="icon-user-plus"></i>
            </div>
          </div>
          <div className="col-12">
            <div className="form-input">
              <label htmlFor="" className="form-label">
                Add Task
              </label>
              <textarea name="" id=""></textarea>
            </div>
          </div>
          <div className="col-12">
            <div className="form-group mb-0">
              <label htmlFor="" className="form-label">
                Participant
              </label>
              <Select
                placeholder="Participant"
                options={[
                  { value: 1, label: "Participant1" },
                  { value: 2, label: "Participant2" },
                  { value: 2, label: "Participant3" },
                ]}
                onChange={() => setSelectedParticipant("")}
              />
            </div>
          </div>
          <div className="col-12">
            <div className="form-group mb-0">
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
                onChange={() => setSelectedStatus("")}
              />
            </div>
          </div>
          <div className="col-12">
            <div className="form-input">
              <label htmlFor="" className="form-label">
                Status
              </label>
              <DatePicker onChange={onChange} placeholder="2023-11-28" />
            </div>
          </div>
          <div className="col-12">
            <div className="row gy-3 gx-2">
              <div className="col-12 col-sm-6">
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100"
                  onClick={() => setShow(false)}
                >
                  Cancel
                </button>
              </div>
              <div className="col-12 col-sm-6">
                <button type="submit" className="btn btn-dark w-100">
                  Save
                </button>
              </div>
            </div>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}
