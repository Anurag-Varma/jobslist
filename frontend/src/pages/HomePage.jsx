import React from 'react'
import Header from '../components/Header';
import ExpandableCard from '../components/ExpandableCard';
import JobsList from '../components/JobsList';
import { Container } from 'react-bootstrap'
import JobInfo from '../components/JobInfo';
import { useState, useRef } from 'react';

const HomePage = ({ user }) => {
    const [defaultJob, setDefaultJob] = useState(null)

    const handleSetDefaultJob = (job) => {
        setDefaultJob(job)
    }

    const jobInfoContainerRef = useRef(null);

    const handleMiniJobClickScroll = () => {
        if (jobInfoContainerRef.current) {
            jobInfoContainerRef.current.scrollTop = 0;
        }
    };

    const [searchData, setSearchData] = useState(null);

    const handleJobSearch = (func) => {
        setSearchData(() => func);
    }

    const [fetchingJobsLoading, setFetchingJobsLoading] = useState(false);

    const [totalJobCount, setTotalJobCount] = useState(true);

    const [searchText, setSearchText] = useState("");

    const [submitSearch, setSubmitSearch] = useState("");

    return (
        <div>
            <Header user={user} setSearchText={setSearchText} setSubmitSearch={setSubmitSearch} />
            <ExpandableCard handleJobSearch={handleJobSearch} searchText={searchText} submitSearch={submitSearch} />

            <Container style={{ opacity: fetchingJobsLoading ? 0.7 : 1, maxWidth: "1200px", width: "100%", padding: "0", display: "flex", flexDirection: "row", justifyContent: "center", transition: "opacity 0.5s linear" }}>
                <JobsList defaultJob={defaultJob} handleSetDefaultJob={handleSetDefaultJob} setTotalJobCount={setTotalJobCount} totalJobCount={totalJobCount} setFetchingJobsLoading={setFetchingJobsLoading} handleMiniJobClickScroll={handleMiniJobClickScroll} searchData={searchData} />
                <JobInfo user={user} defaultJob={defaultJob} handleSetDefaultJob={handleSetDefaultJob} totalJobCount={totalJobCount} fetchingJobsLoading={fetchingJobsLoading} jobInfoContainerRef={jobInfoContainerRef} />
            </Container>

        </div>
    )
}

export default HomePage
