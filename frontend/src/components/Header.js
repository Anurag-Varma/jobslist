import React from 'react';
import { Navbar, Container, Form, InputGroup, FormControl, Nav, Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Header.css';
import { Search } from 'react-bootstrap-icons';

import { useState, forwardRef } from 'react';
import { useSetRecoilState } from 'recoil';
import { Link } from 'react-router-dom';
import userAtom from '../atoms/userAtom';
import useShowToast from '../hooks/useShowToast';
import authScreenAtom from '../atoms/authAtom';

function Header({ user, setSearchText, setSubmitSearch }) {
    const [focus, setfocus] = useState(false);
    const [click, setclick] = useState(false);

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
            }
            else {
                localStorage.removeItem('jobs-list');
                setUser(null);
                setAuthScreenState('login');
            }

        }
        catch (error) {
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
        setSubmitSearch(search)
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
                            // onFocus={handleClick}
                            onMouseDownCapture={() => handleClick(true)}
                            onMouseUpCapture={() => handleClick(false)}
                            type='submit'
                        >
                            Search
                        </button>
                    </Form>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />

                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                        </Nav>

                        <p className="navbar-user-name">{user && user.name}</p>

                        <Nav>
                            <Dropdown align="end">
                                <Dropdown.Toggle as={CustomToggle} />

                                <Dropdown.Menu>
                                    <Dropdown.Item as={Link} to="/editProfile">Edit Profile</Dropdown.Item>
                                    <Dropdown.Item as={Link} to="/logout" onClick={handleLogout}>Logout</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar >
            <hr style={{ margin: 0 }} />
        </>
    );
}

export default Header;
