import MiniJob from './MiniJob'
import React, { useState, useEffect, useRef } from 'react'
import './JobsList.css'
import axios from 'axios'
import { Container } from 'react-bootstrap'

import useShowToast from '../hooks/useShowToast';
import NoJobs from './NoJobs'

import Spinner from './Spinner'


const JobsList = ({ defaultJob, handleSetDefaultJob, setTotalJobCount, totalJobCount, setFetchingJobsLoading, handleMiniJobClickScroll, searchData }) => {

    const [items, setItems] = useState([]);

    const [miniJobclickedIndex, setMiniJobclickedIndex] = useState(null);

    const showToast = useShowToast();

    const [updateSource, setUpdateSource] = useState("");

    const apiUrl = process.env.BACKEND_API_URL;

    const searchJobs = async (data) => {
        try {
            setUpdateSource("fetching");
            setFetchingJobsLoading(true);
            const response = await axios.post(`${apiUrl}/api/jobs/`, data,
                {
                    withCredentials: true
                }
            );
            const jobs = await response.data.jobs;
            setItems(jobs);

            if (jobs.length > 0) {
                const firstJobResponse = await axios.get(`${apiUrl}/api/jobs/${jobs[0]._id}`, {
                    withCredentials: true
                });
                handleSetDefaultJob(firstJobResponse.data.job);
                setMiniJobclickedIndex(firstJobResponse.data.job._id);
            } else {
                handleSetDefaultJob(null);
                setMiniJobclickedIndex(null);
            }
            setCurrentPage(1);
        } catch (error) {
            showToast('Error', error.message, 'error');
        }
        finally {
            setUpdateSource("done");
            setFetchingJobsLoading(false);
        }
    };



    useEffect(() => {
        if (!searchData) {
            searchJobs({});
        }
        else {
            searchJobs(searchData);
        }

        if (items && items.length === 0) {
            setMiniJobclickedIndex(null);
            handleSetDefaultJob(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchData]);

    useEffect(() => {
        if (updateSource === "done") {
            miniJobViewed(miniJobclickedIndex);
            setUpdateSource("");
            if (items && items.length === 0) {
                setTotalJobCount(false);
            }
            else {
                setTotalJobCount(true);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateSource, items]);

    useEffect(() => {
        // Define an async function inside the useEffect
        const updateJobDetails = async () => {
            if (defaultJob && defaultJob.applied) {
                try {
                    await axios.put(`${apiUrl}/api/users/updateJobDetails`, {
                        "jobApplied": defaultJob._id
                    }, {
                        withCredentials: true
                    });

                    const newItems = items.map(item =>
                        item._id === defaultJob._id ? { ...item, applied: true } : item
                    );

                    // Update the items state
                    setItems(newItems);
                } catch (error) {
                    showToast('Error', error.message, 'error');
                }
            }
        };
        // Call the async function
        updateJobDetails();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultJob]);


    const miniJobViewed = async (index) => {
        try {
            await axios.put(`${apiUrl}/api/users/updateJobDetails`, {
                "jobViewed": index
            }, {
                withCredentials: true
            })

            const newItems = items.map(item =>
                item._id === index ? { ...item, viewed: true } : item
            );

            // Update the items state
            setItems(newItems);
        }
        catch (error) {
            showToast('Error', error.message, 'error');
        }
    }

    const handleMiniJobClick = async (index) => {
        try {
            await axios.get(`${apiUrl}/api/jobs/${index}`, {
                withCredentials: true
            })
                .then(response => {
                    handleSetDefaultJob(response.data.job);
                    setMiniJobclickedIndex(index);
                    handleMiniJobClickScroll();
                })
        }
        catch (error) {
            showToast('Error', error.message, 'error');
        }

        miniJobViewed(index);
    };

    // State to manage pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Number of items per page

    // Calculate the total number of pages
    var totalPages = 0;

    if (items) {
        totalPages = Math.ceil(items.length / itemsPerPage);
    }

    // Get the items for the current page
    var currentItems = []

    if (items) {
        currentItems = items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    }

    const miniJobContainerRef = useRef(null);

    useEffect(() => {
        if (currentItems && currentItems.length > 0) {
            const index = currentItems[0]._id;
            handleMiniJobClick(index);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    // Handler for changing pages
    const handlePageChange = (page) => {
        setCurrentPage(page);

        if (miniJobContainerRef.current) {
            miniJobContainerRef.current.scrollTop = 0;
        }
    };

    const handleRemoveMiniJob = async (index) => {

        try {
            await axios.put(`${apiUrl}/api/users/updateJobDetails`, {
                "jobDeleted": index
            }, {
                withCredentials: true
            })

            // Remove the item from the items array
            const newItems = items.map(item =>
                item._id === index ? { ...item, deleted: !item.deleted } : item
            );

            // Update the items state
            setItems(newItems);
        }
        catch (error) {
            showToast('Error', error.message, 'error');
        }

    };

    const paginationFunc = () => {

        const totalButtons = 5;
        const half = Math.floor(totalButtons / 2);
        let start = Math.max(1, currentPage - half);
        let end = Math.min(totalPages, currentPage + half);

        // Adjust start and end if they go out of bounds
        if (currentPage - half < 1) {
            end = Math.min(totalPages, end + (half - currentPage + 1));
        }
        if (currentPage + half > totalPages) {
            start = Math.max(1, start - (currentPage + half - totalPages));
        }

        const pages = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages.map((pageIndex) => (
            <button
                key={pageIndex}
                onClick={() => handlePageChange(pageIndex)}
                className={currentPage === pageIndex ? 'active' : ''}
            >
                {pageIndex}
            </button>
        ));
    }

    return (

        updateSource === "fetching" ?
            (
                <Spinner />
            )
            :
            (
                !totalJobCount ?
                    (
                        <NoJobs />
                    )
                    :
                    (
                        <Container className="jobs-list-container" style={{ margin: "0", padding: "0" }} ref={miniJobContainerRef}>
                            <div className='job-list-seperator'>
                            </div>

                            {currentItems.map((job) => (
                                <MiniJob
                                    key={job._id}
                                    job={job}
                                    isMiniJobClicked={miniJobclickedIndex === job._id}
                                    onClick={() => handleMiniJobClick(job._id)}
                                    onRemove={handleRemoveMiniJob}
                                />
                            ))}
                            <div className="pagination">

                                {currentPage > 1 && (
                                    <button className='previous-button' onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
                                )}

                                {paginationFunc()}

                                {currentPage < totalPages && (
                                    <button className='next-button' onClick={() => handlePageChange(currentPage + 1)}>Next</button>
                                )}
                            </div>

                        </Container>
                    )
            )
    )
}

export default JobsList