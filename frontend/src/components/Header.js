import React, { useState, forwardRef } from 'react';
import { Navbar, Container, Form, InputGroup, FormControl, Nav, Dropdown, Button, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Header.css';
import { Search } from 'react-bootstrap-icons';
import { useSetRecoilState } from 'recoil';
import { Link } from 'react-router-dom';
import userAtom from '../atoms/userAtom';
import useShowToast from '../hooks/useShowToast';
import authScreenAtom from '../atoms/authAtom';

function Header({ user, setSearchText, setSubmitSearch, handleSetCustomJob }) {
    const [focus, setfocus] = useState(false);
    const [click, setclick] = useState(false);
    const [showModal, setShowModal] = useState(false); // For modal visibility
    const [jobTitle, setJobName] = useState('');
    const [jobCompany, setJobCompany] = useState('');
    const [jobLink, setJobLink] = useState('');
    const [jobCompanyLinkedinLink, setJobCompanyLinkedinLink] = useState('');

    const handleFocus = () => {
        setfocus(!focus);
    };

    const handleClick = (param) => {
        setclick(param);
    };

    const setUser = useSetRecoilState(userAtom);
    const showToast = useShowToast();
    const setAuthScreenState = useSetRecoilState(authScreenAtom);

    const handleLogout = async () => {
        try {
            const apiUrl = process.env.REACT_APP_BACKEND_API_URL;
            const res = await fetch(`${apiUrl}/api/users/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await res.json();
            if (data.error) {
                showToast('Error', data.error, 'error');
                return;
            } else {
                localStorage.removeItem('jobs-list');
                setUser(null);
                setAuthScreenState('login');
            }
        } catch (error) {
            showToast('Error', error.message, 'error');
        }
    };

    const CustomToggle = forwardRef(({ onClick }, ref) => (
        <img
            src="person.png"
            width="40"
            height="40"
            className="navbar-user-profile"
            alt="User Logo"
            style={{ cursor: 'pointer' }}
            ref={ref}
            onClick={(e) => {
                e.preventDefault();
                onClick(e);
            }}
        />
    ));

    const [search, setSearch] = useState('');

    const handleChange = (e) => {
        setSearch(e.target.value);
        setSearchText(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitSearch(search);
    };

    // Modal open/close handlers
    const handleCloseModal = () => setShowModal(false);
    const handleShowModal = () => setShowModal(true);

    // Handle the modal form submission
    const handleModalSubmit = (e) => {
        e.preventDefault();

        handleSetCustomJob({ job_title: jobTitle, job_company: jobCompany, job_url_direct: jobLink, job_company_linkedin_url: jobCompanyLinkedinLink });

        // Reset form fields
        setJobName('');
        setJobCompany('');
        setJobLink('');
        setJobCompanyLinkedinLink('');

        // Close modal
        handleCloseModal();
    };

    return (
        <>
            <Navbar expand="sm" className="custom-navbar">
                <Container className='custom-navbar-container'>
                    <Navbar.Brand href="/" className='custom-navbar-brand'>Jobs List</Navbar.Brand>
                    <Form className="d-flex" onSubmit={handleSubmit}>
                        <InputGroup className="me-2" >
                            <InputGroup.Text className={`navbar-search-icon ${focus ? 'focus' : ''}`}>
                                <Search />
                            </InputGroup.Text>
                            <FormControl
                                className={`navbar-search-input ${focus ? 'focus' : ''}`}
                                type="search"
                                placeholder="Title, company or location"
                                value={search}
                                onChange={handleChange}
                                onFocus={handleFocus}
                                onBlur={handleFocus}
                            />
                        </InputGroup>
                        <button
                            className={`navbar-search-button ${click ? 'clicked' : ''}`}
                            onMouseDownCapture={() => handleClick(true)}
                            onMouseUpCapture={() => handleClick(false)}
                            type='submit'
                        >
                            Search
                        </button>
                    </Form>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />

                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto w-100 d-flex justify-content-center">
                            {/* Centered Add Job Button */}
                            {
                                user && user.isPro &&
                                <Button variant="outline-primary" onClick={handleShowModal}>
                                    Custom Job Referral
                                </Button>
                            }
                        </Nav>

                        <Nav className="ms-auto d-flex align-items-center">
                            {/* User name with no wrap, flex-grow to take available space */}
                            <p className="navbar-user-name mb-2" style={{ whiteSpace: 'nowrap', flexGrow: 1 }}>
                                {user && user.name}
                            </p>
                        </Nav>
                        <Nav>
                            <Dropdown align="end">
                                <Dropdown.Toggle as={CustomToggle} />

                                <Dropdown.Menu>
                                    <Dropdown.Item as={Link} to="/editProfile">Edit Profile</Dropdown.Item>
                                    <Dropdown.Item as={Link} onClick={handleLogout}>Logout</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Nav>
                    </Navbar.Collapse>


                </Container>
            </Navbar >
            <hr style={{ margin: 0 }} />

            {/* Modal */}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Enter Custom Job Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleModalSubmit}>
                        <Form.Group className="mb-3" controlId="jobTitle">
                            <Form.Label>Job Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter job title"
                                value={jobTitle}
                                onChange={(e) => setJobName(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="jobCompany">
                            <Form.Label>Job Company</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter company name"
                                value={jobCompany}
                                onChange={(e) => setJobCompany(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="jobLink">
                            <Form.Label>Job Link</Form.Label>
                            <Form.Control
                                type="url"
                                placeholder="Enter job link"
                                value={jobLink}
                                onChange={(e) => setJobLink(e.target.value)}
                                required
                            />
                        </Form.Group>

                        {
                            user && user.isPro && user.isAdmin &&
                            <Form.Group className="mb-3" controlId="jobCompanyLinkedinLink">
                                <Form.Label>Company Linkedin Link</Form.Label>
                                <Form.Control
                                    type="url"
                                    placeholder="Enter company linkedin link"
                                    value={jobCompanyLinkedinLink}
                                    onChange={(e) => setJobCompanyLinkedinLink(e.target.value)}
                                    required
                                />
                            </Form.Group>
                        }

                        <Button variant="success" type="submit">
                            Submit
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default Header;
