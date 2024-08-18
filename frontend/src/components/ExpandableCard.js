import React, { useState, useRef, useEffect } from 'react';
import { Button, Card, Container, Row, Col, Form, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faAngleDoubleLeft } from '@fortawesome/free-solid-svg-icons';
import './ExpandableCard.css'; // Ensure this CSS file is in the same directory

const ExpandableCard = ({ handleJobSearch, searchText, submitSearch }) => {

    const [expanded, setExpanded] = useState(false);
    const cardRef = useRef(null);

    const toggleCard = () => {
        setExpanded(prevState => !prevState);
    };

    const handleClickOutside = (event) => {
        if (cardRef.current && !cardRef.current.contains(event.target)) {
            setExpanded(false);
        }
    };

    useEffect(() => {
        // Add event listener when the component mounts
        document.addEventListener('mousedown', handleClickOutside);

        // Clean up the event listener when the component unmounts
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const industries = ["IT Services and IT Consulting", "Software Development", "Staffing and Recruiting", "Defense and Space Manufacturing", "Technology, Information and Internet", "Financial Services", "Information Technology & Services", "Business Consulting and Services", "Hospitals and Health Care", "Banking", "Information Services"]


    const truncateLabel = (label) => label.length > 20 ? `${label.slice(0, 17)}...` : label;

    const jobFunctions = ["Information Technology", "Engineering", "Other", "Consulting", "Research", "Quality Assurance", "Business Development", "Sales", "Analyst", "Finance", "Design"]

    const locations = [
        "New York, NY",
        "Los Angeles, CA",
        "Atlanta, GA",
        "Dallas, TX",
        "Boston, MA",
        "San Antonio, TX",
        "San Diego, CA",
        "Nashville, TN",
        "Chicago, IL",
        "Houston, TX",
        "Brooklyn, NY",
        "Austin, TX",
        "New Orleans, LA",
        "Charlotte, NC"
    ];

    const [inputTagValue, setInputTagValue] = useState('');
    const [tags, setTags] = useState([]);

    const handleKeyDownTag = (e) => {
        if (e.key === 'Enter' && inputTagValue.trim()) {
            e.preventDefault(); // Prevent form submission on Enter key
            setTags([...tags, inputTagValue.trim()]);
            setInputTagValue('');
        }
    };

    const handleChangeTag = (e) => {
        setInputTagValue(e.target.value);
    };

    const handleRemoveTag = (index) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    const [formState, setFormState] = useState({
        datePosted: "any",
        jobTypes: [],
        easyApply: false,
        appliedJobs: false,
        viewedJobs: false,
        experienceLevels: [],
        locations: [],
        industries: [],
        jobFunctions: []
    });

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;

        if (type === 'radio') {
            setFormState(prevState => ({
                ...prevState,
                [name]: value
            }));
        } else if (type === 'checkbox') {
            setFormState(prevState => {
                if (name === 'easyApply' || name === 'appliedJobs' || name === 'viewedJobs') {
                    return {
                        ...prevState,
                        [name]: checked
                    };
                } else {
                    const values = prevState[name] || [];
                    return {
                        ...prevState,
                        [name]: checked ? [...values, value] : values.filter(v => v !== value)
                    };
                }
            });
        }
    };


    const handleReset = () => {
        setFormState({
            datePosted: "any",
            jobTypes: [],
            easyApply: false,
            appliedJobs: false,
            viewedJobs: false,
            experienceLevels: [],
            locations: [],
            industries: [],
            jobFunctions: []
        });
        setTags([]);
    };


    useEffect(() => {
        handleSubmit();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [submitSearch]);



    const handleSubmit = (e) => {
        if (e) {
            e.preventDefault();
        }

        const jsonData = {
            "search_job_title": searchText,
            "job_location": formState.locations,
            "job_type": formState.jobTypes,
            "job_experience_level": formState.experienceLevels,
            "job_function": formState.jobFunctions,
            "job_company_industry": formState.industries,
            "job_easy_apply": formState.easyApply ? "true" : "false",
            "show_jobs_applied": "false",
            // "show_jobs_applied": formState.appliedJobs ? "true" : "false",
            "show_jobs_viewed": formState.viewedJobs ? "true" : "false",
            "job_date_posted": formState.datePosted,
            "tags": tags
        }

        handleJobSearch(jsonData);
        setExpanded(false);
    };


    return (
        <div className="expandable-card">
            {!expanded &&
                <Button className="btn-outline-secondary expandable-card-button" onClick={toggleCard}>
                    <FontAwesomeIcon icon={faAngleDoubleLeft} /> Filters
                </Button>
            }
            <Card
                className={`expandable-slide-card ${expanded ? 'expanded' : ''}`}
                ref={cardRef}
            >
                <Card.Body>
                    <FontAwesomeIcon
                        icon={faTimes}
                        className="close-icon"
                        onClick={toggleCard}
                    />
                    <Card.Title>Filter jobs by</Card.Title>
                    <br /><br />

                    <Container className="expandable-card-container">
                        <Form onSubmit={handleSubmit}>
                            <div>
                                <h5 className='mb-3'>Date posted</h5>

                                <Row className='mb-2'>
                                    <Col>
                                        <Form.Check
                                            type="radio"
                                            name="datePosted"
                                            label="Any time"
                                            value="any"
                                            id='datePosted-any'
                                            checked={formState.datePosted === 'any'}
                                            onChange={handleChange}
                                        />
                                    </Col>
                                    <Col>
                                        <Form.Check
                                            type="radio"
                                            name="datePosted"
                                            label="Past 5 days"
                                            value="5days"
                                            id='datePosted-5days'
                                            checked={formState.datePosted === '5days'}
                                            onChange={handleChange}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Form.Check
                                            type="radio"
                                            name="datePosted"
                                            label="Past 3 days"
                                            value="3days"
                                            id='datePosted-3days'
                                            checked={formState.datePosted === '3days'}
                                            onChange={handleChange}
                                        />
                                    </Col>
                                    <Col>
                                        <Form.Check
                                            type="radio"
                                            name="datePosted"
                                            label="Past 24 hours"
                                            value="day"
                                            id='datePosted-day'
                                            checked={formState.datePosted === 'day'}
                                            onChange={handleChange}
                                        />
                                    </Col>
                                </Row>
                            </div>
                            <hr />

                            <div>
                                <h5 className='mb-3'>Job type</h5>
                                <Row className='mb-2'>
                                    <Col>
                                        <Form.Check
                                            type="checkbox"
                                            name="jobTypes"
                                            label="Full-Time"
                                            value="Full-Time"
                                            id='jobTypes-full-time'
                                            checked={formState.jobTypes.includes('Full-Time')}
                                            onChange={handleChange}
                                        />
                                    </Col>
                                    <Col>
                                        <Form.Check
                                            type="checkbox"
                                            name="jobTypes"
                                            label="Part-Time"
                                            value="Part-Time"
                                            id='jobTypes-part-time'
                                            checked={formState.jobTypes.includes('Part-Time')}
                                            onChange={handleChange}
                                        />
                                    </Col>
                                </Row>
                                <Row className='mb-2'>
                                    <Col>
                                        <Form.Check
                                            type="checkbox"
                                            name="jobTypes"
                                            label="Contract"
                                            value="Contract"
                                            id='jobTypes-contract'
                                            checked={formState.jobTypes.includes('Contract')}
                                            onChange={handleChange}
                                        />
                                    </Col>
                                    <Col>
                                        <Form.Check
                                            type="checkbox"
                                            name="jobTypes"
                                            label="Temporary"
                                            value="Temporary"
                                            id='jobTypes-temporary'
                                            checked={formState.jobTypes.includes('Temporary')}
                                            onChange={handleChange}
                                        />
                                    </Col>
                                </Row>
                                <Row className='mb-2'>
                                    <Col>
                                        <Form.Check
                                            type="checkbox"
                                            name="jobTypes"
                                            label="Volunteer"
                                            value="Volunteer"
                                            id='jobTypes-volunteer'
                                            checked={formState.jobTypes.includes('Volunteer')}
                                            onChange={handleChange}
                                        />
                                    </Col>
                                    <Col>
                                        <Form.Check
                                            type="checkbox"
                                            name="jobTypes"
                                            label="Internship"
                                            value="Internship"
                                            id='jobTypes-internship'
                                            checked={formState.jobTypes.includes('Internship')}
                                            onChange={handleChange}
                                        />
                                    </Col>
                                </Row>
                                <Row className='mb-2'>
                                    <Col>
                                        <Form.Check
                                            type="checkbox"
                                            name="jobTypes"
                                            label="Other"
                                            value="Other"
                                            id='jobTypes-other'
                                            checked={formState.jobTypes.includes('Other')}
                                            onChange={handleChange}
                                        />
                                    </Col>
                                </Row>
                            </div>
                            <hr />

                            <div className='easy-apply-div'>
                                <Row>
                                    <Col>
                                        <h5>Easy Apply</h5>
                                    </Col>
                                    <Col >
                                        <Form.Check
                                            type="switch"
                                            label={formState.easyApply ? "on" : "off"}
                                            style={{ "marginLeft": "50px" }}
                                            className='easyApply'
                                            name="easyApply"
                                            id='easyApply'
                                            checked={formState.easyApply}
                                            onChange={handleChange}
                                        />
                                    </Col>
                                </Row>
                            </div>
                            <hr />

                            {/* <div className='applied-jobs-div'>
                                <Row>
                                    <Col>
                                        <h5>Applied jobs</h5>
                                    </Col>
                                    <Col>
                                        <Form.Check
                                            type="switch"
                                            label={formState.appliedJobs ? "Show" : "Hide"}
                                            style={{ "marginLeft": "50px" }}
                                            name="appliedJobs"
                                            id='appliedJobs'
                                            checked={formState.appliedJobs}
                                            onChange={handleChange}
                                        />
                                    </Col>
                                </Row>
                            </div>
                            <hr /> */}

                            <div className='viewed-jobs-div'>
                                <Row>
                                    <Col>
                                        <h5>Previously Viewed jobs</h5>
                                    </Col>
                                    <Col>
                                        <Form.Check
                                            type="switch"
                                            label={formState.viewedJobs ? "Show" : "Hide"}
                                            style={{ "marginLeft": "50px" }}
                                            name="viewedJobs"
                                            id='viewedJobs'
                                            checked={formState.viewedJobs}
                                            onChange={handleChange}
                                        />
                                    </Col>
                                </Row>
                            </div>
                            <hr />

                            <div>
                                <h5 className='mb-3'>Experience level</h5>

                                <Row className='mb-2'>
                                    <Col>
                                        <Form.Check
                                            type="checkbox"
                                            name="experienceLevels"
                                            label="Internship"
                                            value="Internship"
                                            id='experienceLevels-internship'
                                            checked={formState.experienceLevels.includes('Internship')}
                                            onChange={handleChange}
                                        />
                                    </Col>
                                    <Col>
                                        <Form.Check
                                            type="checkbox"
                                            name="experienceLevels"
                                            label="Entry Level"
                                            value="Entry Level"
                                            id='experienceLevels-entry-level'
                                            checked={formState.experienceLevels.includes('Entry Level')}
                                            onChange={handleChange}
                                        />
                                    </Col>
                                </Row>
                                <Row className='mb-2'>
                                    <Col>
                                        <Form.Check
                                            type="checkbox"
                                            name="experienceLevels"
                                            label="Associate"
                                            value="Associate"
                                            id='experienceLevels-associate'
                                            checked={formState.experienceLevels.includes('Associate')}
                                            onChange={handleChange}
                                        />
                                    </Col>
                                    <Col>
                                        <Form.Check
                                            type="checkbox"
                                            name="experienceLevels"
                                            label="Mid-Senior Level"
                                            value="Mid-Senior Level"
                                            id='experienceLevels-mid-senior-level'
                                            checked={formState.experienceLevels.includes('Mid-Senior Level')}
                                            onChange={handleChange}
                                        />
                                    </Col>
                                </Row>
                                <Row className='mb-2'>
                                    <Col>
                                        <Form.Check
                                            type="checkbox"
                                            name="experienceLevels"
                                            label="Director"
                                            value="Director"
                                            id='experienceLevels-director'
                                            checked={formState.experienceLevels.includes('Director')}
                                            onChange={handleChange}
                                        />
                                    </Col>
                                    <Col>
                                        <Form.Check
                                            type="checkbox"
                                            name="experienceLevels"
                                            label="Executive"
                                            value="Executive"
                                            id='experienceLevels-executive'
                                            checked={formState.experienceLevels.includes('Executive')}
                                            onChange={handleChange}
                                        />
                                    </Col>
                                </Row>
                            </div>
                            <hr />

                            <div className='expandable-keywords'>
                                <h5 className='mb-3'>Hide jobs having the keywords:</h5>

                                <div>
                                    <input
                                        type="text"
                                        value={inputTagValue}
                                        onChange={handleChangeTag}
                                        onKeyDown={handleKeyDownTag}
                                        placeholder="Type a Keyword and press Enter"
                                    />
                                </div>
                                <div className='expandable-keywords-div'>
                                    {tags.map((tag, index) => (
                                        <Badge key={index} className='expandable-keywords-badge' onClick={() => handleRemoveTag(index)}>
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <hr />

                            <div>
                                <h5 className='mb-3'>Location</h5>
                                {locations.map((location, index) => (
                                    index % 2 === 0 ? (
                                        <Row key={index} className='mb-2'>
                                            <Col>
                                                <Form.Check
                                                    type="checkbox"
                                                    name="locations"
                                                    label={location}
                                                    value={location}
                                                    id={`locations-${location.replace(/, /g, '-').replace(/ /g, '-').toLowerCase()}`}
                                                    checked={formState.locations.includes(location)}
                                                    onChange={handleChange}
                                                />
                                            </Col>
                                            {index + 1 < locations.length && (
                                                <Col>
                                                    <Form.Check
                                                        type="checkbox"
                                                        name="locations"
                                                        label={locations[index + 1]}
                                                        value={locations[index + 1]}
                                                        id={`locations-${locations[index + 1].replace(/, /g, '-').replace(/ /g, '-').toLowerCase()}`}
                                                        checked={formState.locations.includes(locations[index + 1])}
                                                        onChange={handleChange}
                                                    />
                                                </Col>
                                            )}
                                        </Row>
                                    ) : null
                                ))}
                            </div>
                            <hr />

                            <div>
                                <h5 className='mb-3'>Industry</h5>
                                {industries.map((industry, index) => (
                                    index % 2 === 0 ? (
                                        <Row key={index} className="mb-2">
                                            <Col>
                                                <Form.Check
                                                    type="checkbox"
                                                    name="industries"
                                                    label={truncateLabel(industry)}
                                                    value={industry}
                                                    id={`industries-${index}`}
                                                    checked={formState.industries.includes(industry)}
                                                    onChange={handleChange}
                                                />
                                            </Col>
                                            {index + 1 < industries.length && (
                                                <Col>
                                                    <Form.Check
                                                        type="checkbox"
                                                        name="industries"
                                                        label={truncateLabel(industries[index + 1])}
                                                        value={industries[index + 1]}
                                                        id={`industries-${index + 1}`}
                                                        checked={formState.industries.includes(industries[index + 1])}
                                                        onChange={handleChange}
                                                    />
                                                </Col>
                                            )}
                                        </Row>
                                    ) : null
                                ))}
                            </div>
                            <hr />

                            <div>
                                <h5 className='mb-3'>Job function</h5>
                                {jobFunctions.map((jobFunction, index) => (
                                    index % 2 === 0 ? (
                                        <Row key={index} className="mb-2">
                                            <Col>
                                                <Form.Check
                                                    type="checkbox"
                                                    name="jobFunctions"
                                                    label={truncateLabel(jobFunction)}
                                                    value={jobFunction}
                                                    id={`jobFunctions-${index}`}
                                                    checked={formState.jobFunctions.includes(jobFunction)}
                                                    onChange={handleChange}
                                                />
                                            </Col>
                                            {index + 1 < jobFunctions.length && (
                                                <Col>
                                                    <Form.Check
                                                        type="checkbox"
                                                        name="jobFunctions"
                                                        label={truncateLabel(jobFunctions[index + 1])}
                                                        value={jobFunctions[index + 1]}
                                                        id={`jobFunctions-${index + 1}`}
                                                        checked={formState.jobFunctions.includes(jobFunctions[index + 1])}
                                                        onChange={handleChange}
                                                    />
                                                </Col>
                                            )}
                                        </Row>
                                    ) : null
                                ))}
                            </div>

                        </Form>
                    </Container>

                    <br /><br /><br />
                    <div className='expandable-card-footer card-footer'>
                        <Button variant="secondary-outline" className='reset' onClick={handleReset}>Reset</Button>
                        <Button variant="primary" className='show-results' type='submit' onClick={handleSubmit}>Show results</Button>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default ExpandableCard;
