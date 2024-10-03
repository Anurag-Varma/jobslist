import React from 'react'
import { Container, Row, Col, Badge, Button } from 'react-bootstrap';
import './JobInfo.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import useShowToast from '../hooks/useShowToast';


const JobInfo = ({ user, defaultJob, handleSetDefaultJob, fetchingJobsLoading, totalJobCount, jobInfoContainerRef }) => {
    var job = defaultJob;

    var resultMessage;
    if (job) {
        // Parse job.job_date_posted into a Date object
        var jobDate = new Date(job.job_date_posted);

        // Create a new Date object for the current date
        var currentDate = new Date();

        // Calculate the difference in milliseconds
        var timeDifference = currentDate - jobDate;

        // Convert milliseconds to days
        const job_posted_days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

        if (job_posted_days === 0) {
            resultMessage = "Less than 24 hours ago";
        } else if (job_posted_days > 31) {
            resultMessage = "1 Month ago";
        } else {
            resultMessage = job_posted_days + " Days ago";
        }

    }

    const handleJobInfoDirectButtonClick = async () => {
        handleSetDefaultJob({ ...defaultJob, applied: true });

        window.open(job.job_url_direct, '_blank');

    }

    const handleJobInfoLinkedinButtonClick = () => {
        handleSetDefaultJob({ ...defaultJob, applied: true });

        window.open(job.job_url_linkedin, '_blank');
    }

    const handleEmailSendButtonClick = async () => {
        try {
            const apiUrl = process.env.REACT_APP_BACKEND_API_URL;
            const res = await axios.post(`${apiUrl}/api/users/referralEmail`, { job }, {
                withCredentials: true
            });

            console.log(res.data);

        } catch (error) {
            if (error.response) {
                showToast('Error', error.response.data.error, 'error');
            } else {
                showToast('Error', error.message, 'error');
            }
        }

        // window.open("/", '_blank');
    }

    const showToast = useShowToast();

    const handleDelete = async () => {
        try {
            const apiUrl = process.env.REACT_APP_BACKEND_API_URL;
            await axios.post(`${apiUrl}/api/jobs/deleteJob/`, {
                "jobId": job._id
            }, {
                withCredentials: true
            });

            window.location.reload();
        } catch (error) {
            if (error.response) {
                showToast('Error', error.response.data.error, 'error');
            } else {
                showToast('Error', error.message, 'error');
            }
        }
    }

    return (
        fetchingJobsLoading ?
            (<></>)
            :
            (
                !totalJobCount ?
                    (<></>)
                    :
                    (
                        <Container className='job-info-container' ref={jobInfoContainerRef}>

                            <Row>
                                <Col style={{ display: "flex", alignItems: "center", flexDirection: "row" }}>
                                    <img
                                        src={job && job.job_company_logo}
                                        alt="Company Logo"
                                        height={"40px"}
                                        width={"40px"}
                                    />
                                    <h6 className='mb-0' style={{ marginLeft: "10px", fontWeight: "bold" }}>{job && job.job_company}</h6>
                                </Col>
                                {user.isAdmin &&
                                    <Col style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                                        <button
                                            onClick={handleDelete}
                                            style={{ border: "none", backgroundColor: "transparent", cursor: "pointer" }}
                                            aria-label="Delete"
                                        >
                                            <FontAwesomeIcon icon={faTrashAlt} style={{ fontSize: "20px", color: "red" }} />
                                        </button>
                                    </Col>
                                }
                            </Row>
                            <Row className="mb-3">
                                <Col>
                                    <h4 className='mt-2'>{job && job.job_title}</h4>
                                    <div style={{ fontSize: "14px" }}><>{job && job.job_location}</>  ·  <span style={{ color: "#22754f", fontWeight: "500" }}>{job && resultMessage}</span> </div>

                                    <div className='mt-2'>
                                        <i className="bi bi-briefcase-fill me-2" style={{ color: "gray" }}></i>
                                        <Badge className="custom-badge-emp-type">Job Type : {job && job.job_type}</Badge>
                                        -
                                        <Badge className="custom-badge-exp-lvl">Experience level : {job && job.job_experience_level}</Badge>
                                    </div>

                                    <div className='mt-2' >
                                        <i className="bi bi-building me-2" style={{ color: "gray" }}></i>
                                        <span className='company-industry'>
                                            Industry : {job && job.job_company_industry}
                                        </span>
                                    </div>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                {job && !job.job_easy_apply ?
                                    (
                                        <Col>
                                            <Button className='job-info-direct-apply-button' variant="primary" onClick={handleJobInfoDirectButtonClick}>
                                                <span className='me-2'>Apply Direct</span>
                                                <i className="bi bi-box-arrow-up-right"></i>
                                            </Button>
                                            <Button className="btn btn-outline-primary job-info-linkedin-apply-button" onClick={handleJobInfoLinkedinButtonClick}>
                                                <span className='me-2'>Apply via LinkedIn</span>
                                                <i className="bi bi-box-arrow-up-right"></i>
                                            </Button>
                                            <Button className="btn  job-info-send-email-button" variant="success" onClick={handleEmailSendButtonClick}>
                                                <span className='me-2'>Referral Emails</span>
                                                <i className="bi bi-box-arrow-up-right"></i>
                                            </Button>
                                        </Col>
                                    )
                                    :
                                    (
                                        <Col>
                                            <Button className='job-info-direct-apply-button' variant="primary" onClick={handleJobInfoDirectButtonClick}>
                                                <span className='me-2'>Easy Apply</span>
                                                <i className="bi bi-box-arrow-up-right"></i>
                                            </Button>
                                            <Button className="btn job-info-send-email-button" variant="success" onClick={handleEmailSendButtonClick}>
                                                <span className='me-2'>Send Emails</span>
                                                <i className="bi bi-box-arrow-up-right"></i>
                                            </Button>
                                        </Col>
                                    )
                                }

                            </Row>
                            <Row>
                                <Col>
                                    <h5>About the job</h5>
                                    <div
                                        className='job-description'
                                        dangerouslySetInnerHTML={{ __html: job && job.job_description }}
                                    ></div>

                                </Col>
                            </Row>
                        </Container >
                    )
            )
    )
}

export default JobInfo
