import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/dashboard-layout.css';

function Sidebar() {
    return (
        <main className="d-flex">
            <div className="flex-shrink-0 p-3  menu-sidebar left-1vw h-75vh w-13vw mt-5vh rounded-2vw">
                <ul className="list-unstyled ps-0 top-8vh  left-1vh               ">
                    <li className="">
                        <Link to="/dashboard" className="nav-link button home w-12vw">
                            Home
                        </Link>
                    </li>
                    <div className="dropdown dropright">
                        <button
                            className="nav-link button projects top-1vh w-12vw"
                            type="button"
                            id="dropdownMenuButton"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                        >
                            Projects
                        </button>
                        <div className="dropdown-menu projects" aria-labelledby="dropdownMenuButton">
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-md-4">
                                        <h3 className="mt-5 text-white project-name text-center">Project 1</h3>
                                    </div>
                                    <div className="col-md-8">
                                        <div className="row">
                                            <div className="col-md-12 mb-1">
                                                <Link to="/experiments" className="nav-link button projects experiments">
                                                    Experiments
                                                </Link>
                                            </div>
                                            <div className="col-md-12">
                                                <Link to="/execution" className="nav-link button projects execution">
                                                    Experiments <br /> Executions
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <hr className="bg-white" />
                            </div>
                        </div>
                    </div>
                    <li className="">
                        <Link to="/requests" className="nav-link button top-2vh w-12vw">
                            Projects Requests
                        </Link>
                    </li>
                    <li className="">
                        <Link to="/settings" className="nav-link button top-3vh w-12vw">
                            Settings
                        </Link>
                    </li>
                </ul>
            </div>
        </main>
    );
}

export default Sidebar;
