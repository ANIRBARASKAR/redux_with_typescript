import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { SERVER_BASE_URL } from "../constants/urles";
import AlertModal from "../components/Alert";
import { saveAs } from 'file-saver';
import JSZip from "jszip";
import * as XLSX from 'xlsx';
import UseUserTeamInfo from "../components/FetchRoleAndTeam";
import moment from "moment";

interface LogProps {}

const Log: React.FC<LogProps> = () => {
  const [activity, setActivity] = useState<string[]>([]);
  const [alertShow, setalertShow] = useState<boolean>(false)
  const [message, setmessage] = useState<string>('')
  const [typeOfAlert, settypeOfAlert] = useState<string>('')
  const params = useParams()
  const {token} = useSelector((state:any) => state.userToken)
  const { userId } = useSelector((state: any) => state.userid)
  const userTeamInfo =  UseUserTeamInfo(userId);
  console.log(userTeamInfo)
  const hasSuperAdminPermission = [1, 2].includes(Number(userTeamInfo.roleName));
  const handleCheckboxChange = (value: string) => {
    setActivity((prevActivity) => {
      if (prevActivity.includes(value)) {
        return prevActivity.filter((item) => item !== value);
      } else {
        return [...prevActivity, value];
      }
    });
  };


const handleDownloadLogs = async (): Promise<void> => {
  try {
    const paramsData = activity.map(item => item.replace(/\s+/g, ' ')).join(',');

    // Encode the string
    const finalParams = encodeURIComponent(paramsData);
    const response = await fetch(`${SERVER_BASE_URL}/logs/download?activity=${finalParams}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const logs = await response.json();
    if (!response.ok) {
      setmessage(logs.error);
      settypeOfAlert("error");
      setalertShow(true);
      return;
    }
    const zip = new JSZip();
    const allData = logs.data.reduce((acc:any, activity:any) => {
      return acc.concat(activity.data);
    }, []);
    
    // Group data by activity
    const groupedData: { [key: string]: any[] } = {};
    allData.forEach((entry:any) => {
      const activityName = entry.activity;
      if (!groupedData[activityName]) {
        groupedData[activityName] = [];
      }
      groupedData[activityName].push(entry);
    });
    
    // Convert timestamp to normal date using moment.js and create separate Excel files
    const promises: Promise<void>[] = [];
    Object.entries(groupedData).forEach(([activityName, activityData]) => {
      activityData.forEach(entry => {
        entry.metadata.createdAt = moment(entry.metadata.createdAt).format('YYYY-MM-DD HH:mm:ss');
        entry.metadata.updatedAt = moment(entry.metadata.updatedAt).format('YYYY-MM-DD HH:mm:ss');
      });
    
      const ws = XLSX.utils.json_to_sheet(activityData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet 1');
    
      const excelBlob = XLSX.write(wb, { bookType: 'xlsx', bookSST: true });
      const fileName = `${activityName}_data.xlsx`;
    
      promises.push(
        new Promise<void>(resolve => {
          zip.file(fileName, excelBlob);
          resolve();
        })
      );
    });
    
    // Wait for all promises to resolve, then create and download the zip file
    Promise.all(promises).then(() => {
      zip.generateAsync({ type: 'blob' }).then(content => {
        saveAs(content, 'all_activities_data.zip');
      });
    });
    setmessage("Logs Downloaded Successfully..!");
    settypeOfAlert("success");
    setalertShow(true);
  } catch (error) {
    console.error("Error during folder Create:", error);
  }
};

const activities = [
    "Login History",
    "Document Upload",
    "Participant and Team Add / Remove",
    "Question Answer Summary",
    "Others (TBC)"
  
];

  
  return (
    <>
    <Navbar />
    <div className="top-action-bar style-2 d-flex flex-wrap">
      <div className="flex-fill d-flex flex-wrap justify-content-start">
        {/* {hasSuperAdminPermission && */}
        <button type="button" className="btn btn-dark" onClick={handleDownloadLogs}>
          Download All
        </button>
{/* } */}
      </div>
    </div>
    <div className="inner-scroller log-page">
      <div className="table-responsive">
        <table className="log-table table">
          <thead>
            <tr>
              <th>
                <div className="form-check d-flex align-items-center mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="name1"
                    value='File Name'
                    onChange={() => handleCheckboxChange("File Name")}
                    checked={activity.includes("File Name")}
                  />
                  <label className="form-check-label" htmlFor="name1">
                    File name
                  </label>
                </div>
              </th>
              <th className="empty-cell"></th>
            </tr>
          </thead>
          
<tbody>
  {activities.map((activityItem) => (
    <tr key={activityItem}>
      <td>
        <div className="form-check d-flex align-items-center mb-0">
          <input
            className="form-check-input"
            type="checkbox"
            id={activityItem}
            value={activityItem}
            onChange={() => handleCheckboxChange(activityItem)}
            checked={activity.includes(activityItem)}
          />
          <label className="form-check-label text-black" htmlFor={activityItem}>
            {activityItem}
          </label>
        </div>
      </td>
      <td className="text-end">
          <button type="button" className="td-icon-btn">
            <i className="icon-download"></i>
          </button>
      </td>
    </tr>
  ))}
</tbody>
        </table>
      </div>
    </div>
    <AlertModal setShow={setalertShow} show={alertShow} msg={message} type={typeOfAlert} />
  </>
  );
};

export default Log;
