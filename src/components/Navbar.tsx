import React, { useCallback, useEffect, useState } from "react";
import logoImg from "../assets/img/logo.svg";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LOGOUT } from "../stateManagement/constants/useConstant";
import { logoutAction } from "../stateManagement/actions/useAction";
import UseUserTeamInfo from "./FetchRoleAndTeam";

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const id = localStorage.getItem("curentWS")

  const toggleNavbar = useCallback(() => {
    if (!isNavbarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    document.body.classList.toggle("nav-open");
    setIsNavbarOpen(!isNavbarOpen);
  }, [isNavbarOpen]);

  useEffect(() => {
    if (document.body.classList.contains("nav-open")) {
      document.body.classList.remove("nav-open");
      document.body.style.overflow = "auto";
    }
  }, []);

  return (
    <nav className="top-nav">
      <div className="top-nav-logo" onClick={() => navigate("/workspace")}>
        <img src={logoImg} alt="" />
      </div>
      <div className="top-nav-links">
        <ul>
          {location.pathname !== "/workspace" &&
          location.pathname !== "/profile" ? (
            <>
              <li>
                <NavLink to={`/home/${id}`}>Home</NavLink>
              </li>
              <li>
                <NavLink to={`/documents/${id}`}>Documents</NavLink>
              </li>
              <li>
                <NavLink to={`/qa/${id}`}>Q&A</NavLink>
              </li>
              <li>
                <NavLink to={`/participates/${id}`}>Participates</NavLink>
              </li>
              <li>
                <NavLink to={`/log/${id}`}>Log</NavLink>
              </li>
              <li>
                <NavLink to={`/workflow/${id}`}>Workflow</NavLink>
              </li>
            </>
          ) : (
            <li>
              <NavLink to={"/workspace"}>Workspace</NavLink>
            </li>
          )}
        </ul>
      </div>
      {
        location.pathname !== "/workspace" && location.pathname !== "/profile" && <div className="top-nav-storage">
        <div className="progress">
          <div className="progress-bar" style={{ width: "35%" }}></div>
        </div>
        <p className="top-nav-storage-text">
          <span>400MB</span> / 1 GB
        </p>
      </div>
      }
      <div className="d-inline-block position-relative">
        <button
          type="button"
          className="top-nav-icon-btn is-notification-btn"
          onClick={() => setNotificationOpen(!notificationOpen)}
        >
          <i className="icon-notification"></i>
          <span>1</span>
        </button>
        <div className={`notification-box ${notificationOpen ? "active" : ""}`}>
          <div className="notification-head d-flex align-items-center justify-content-between">
            <span className="notitication-title">Notification</span>
            <button className="btn btn-link text-dark">Clear All</button>
          </div>
          <div className="notification-items">
            {notificationOpen && (
              <>
                <div className="notification-item">
                  <p>You have New approval request from Abc Efg</p>
                  <div className="d-flex align-items-center justify-content-between">
                    <button
                      type="button"
                      className="btn btn-link text-secondary text-decoration-none"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      className="btn btn-link text-dark text-decoration-none"
                    >
                      View
                    </button>
                  </div>
                </div>
                <div className="notification-item">
                  <p>You have New approval request from Abc Efg</p>
                  <div className="d-flex align-items-center justify-content-between">
                    <button
                      type="button"
                      className="btn btn-link text-secondary text-decoration-none"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      className="btn btn-link text-dark text-decoration-none"
                    >
                      View
                    </button>
                  </div>
                </div>
                <div className="notification-item">
                  <p>You have New approval request from Abc Efg</p>
                  <div className="d-flex align-items-center justify-content-between">
                    <button
                      type="button"
                      className="btn btn-link text-secondary text-decoration-none"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      className="btn btn-link text-dark text-decoration-none"
                    >
                      View
                    </button>
                  </div>
                </div>
                <div className="notification-item">
                  <p>You have New approval request from Abc Efg</p>
                  <div className="d-flex align-items-center justify-content-between">
                    <button
                      type="button"
                      className="btn btn-link text-secondary text-decoration-none"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      className="btn btn-link text-dark text-decoration-none"
                    >
                      View
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <NavLink
        to={
          location.pathname !== "/workspace" &&
          location.pathname !== "/settings" 
            ? `/settings/${id}`
            : "/profile"
        }
        className="top-nav-icon-btn is-setting-btn"
      >
        <i className="icon-settings"></i>
      </NavLink>
      {location.pathname !== "/workspace" &&
      location.pathname !== "/settings" && location.pathname !== "/profile" ? (
        <Link to={"/workspace"} className="top-nav-icon-btn is-back-btn">
          <i className="icon-arrow-left"></i>
        </Link>
      ) : (
        <button type="button" className="top-nav-icon-btn is-logout-btn" onClick={() => {dispatch(logoutAction()); navigate('/')}}>
          <i className="icon-logout"></i>
        </button>
      )}
      <button
        type="button"
        className="top-nav-toggle-btn d-lg-none"
        onClick={() => toggleNavbar()}
      >
        <span></span>
      </button>
      <div
        className="d-lg-none top-nav-overlay"
        onClick={() => toggleNavbar()}
      ></div>
    </nav>
  );
};

export default Navbar;
