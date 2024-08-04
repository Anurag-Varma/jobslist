import React from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';
import './MiniJob.css';
import { X } from 'react-bootstrap-icons';

const MiniJob = ({ job, isMiniJobClicked, onClick, onRemove }) => {

    var extra_info = ""

    if (job.applied) {
        extra_info = "Applied"
    }
    else if (job.viewed) {
        extra_info = "Viewed"
    }

    if (job.job_easy_apply) {
        if (extra_info !== "") {
            extra_info += " - "
        }
        extra_info += "Easy Apply"
    }



    return (
        !job.deleted ?
            (<Container
                className={`mini-job-container ${isMiniJobClicked ? 'clicked' : ''}`}
                onClick={onClick}
            >
                <Row>
                    <Col className='company-logo-col' xs={3} md={2}>
                        <Image
                            src={job.job_company_logo}
                            alt="Company Logo"
                            height={'50px'}
                            width={'50px'}
                        />
                    </Col>
                    <Col xs={7} md={8} className='company-col'>
                        <h6 className="job-title">{job.job_title}</h6>

                        <div className="company-name">
                            {job.job_company}
                        </div>

                        <div className="company-info">
                            {job.job_location}
                        </div>

                        <div className="extra-info">
                            <>{extra_info}</> {job.job_easy_apply && <i className="bi bi-linkedin"></i>}
                        </div>
                    </Col>
                    <Col xs={2} md={2} className="close-icon-col">
                        <X
                            size={20}
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(job._id);
                            }}
                            className="close-icon"
                        />
                    </Col>
                </Row>
            </Container>
            )
            :
            (
                <Container
                    className={`mini-job-container-deleted ${isMiniJobClicked ? 'clicked' : ''}`}
                    onClick={onClick}
                >
                    <Row>
                        <Col className='company-logo-col' xs={3} md={2}>
                            <Image
                                src={job.job_company_logo}
                                alt="Company Logo"
                                height={'50px'}
                                width={'50px'}
                            />
                        </Col>
                        <Col xs={7} md={8} className='company-col'>
                            <h6 className="job-title">{job.job_title}</h6>

                            <div className="company-name">
                                {job.job_company}
                            </div>
                            <div className='deleted-text'>
                                Won't show this job again
                            </div>
                        </Col>
                        <Col xs={2} md={2} className="reload-icon-col">
                            <i className="bi bi-arrow-clockwise reload-icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove(job._id);
                                }}
                            >
                            </i>
                        </Col>
                    </Row>
                </Container >
            )
    );
};

export default MiniJob;
