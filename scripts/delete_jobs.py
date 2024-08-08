import logging
from utils import create_session
from bs4 import BeautifulSoup
import requests
import json
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    filename="delete_jobs_log.txt",  # Name of the log file
    level=logging.ERROR,  # Log level
    format="%(asctime)s - %(levelname)s - %(message)s",  # Log format
)

base_url = "https://www.linkedin.com"

proxies = list[str] | str | None

headers = {
    "authority": "www.linkedin.com",
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "max-age=0",
    "upgrade-insecure-requests": "1",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
}

session = create_session(
    proxies=proxies,
    is_tls=False,
    has_retry=True,
    delay=5,
    clear_cookies=True,
)
session.headers.update(headers)

def _get_job_details(job_id: str) -> bool:
    try:
        response = session.get(
            f"{base_url}/jobs-guest/jobs/api/jobPosting/{job_id}", timeout=5
        )
        response.raise_for_status()
    except Exception as e:
        logging.error(f"Failed to get job details for {job_id}: {e}")
        return False
    
    if "linkedin.com/signup" in response.url:
        logging.info(f"Redirected to signup page for {job_id}")
        return False

    soup = BeautifulSoup(response.text, "html.parser")
    div_content = soup.find(
        "figure", class_=lambda x: x and "closed-job" in x
    )

    if div_content:
        return True
    
    div_content = soup.find(
        "div", class_=lambda x: x and "error-code" in x
    )

    if div_content:
        return True

    return False

def send_post_to_get_cookie():
    try:
        url = "https://api-v1.jobslist.live/api/users/login"

        payload = json.dumps({
            "email": os.getenv("EMAIL"),
            "password": os.getenv("PASSWORD")
        })
        headers = {
            'Referer': 'https://www.jobslist.live',
            'Content-Type': 'application/json',
        }

        response = requests.request("POST", url, headers=headers, data=payload)

        return response.headers["Set-Cookie"].split(';')[0]
    except Exception as e:
        logging.error(f"Failed to get cookie: {e}")
        return None

cookie = send_post_to_get_cookie()


def get_job_ids():
    try:
        url = "https://api-v1.jobslist.live/api/jobs/getJobIds"

        headers = {
            'Referer': 'https://www.jobslist.live',
            'Content-Type': 'application/json',
            'Cookie': cookie
        }

        response = requests.request("GET", url, headers=headers)

        return response.json()["jobs"]
    except Exception as e:
        logging.error(f"Failed to get job IDs: {e}")
        return []

def delete_job(job_id):
    try:
        url = "https://api-v1.jobslist.live/api/jobs/deleteJob"

        headers = {
            'Referer': 'https://www.jobslist.live',
            'Content-Type': 'application/json',
            'Cookie': cookie
        }

        response = requests.request("POST", url, headers=headers)

        return response
    except Exception as e:
        logging.error(f"Failed to delete job {job_id}: {e}")
        return None

jobs = get_job_ids()

for job in jobs:
    try:
        job_id = job["job_url_linkedin"].split('/')[-1]
        if _get_job_details(job_id):
            delete_job(job_id)
            logging.info(f"Deleted job: {job_id}")
        else:
            logging.info(f"Not deleted (job might be open): {job_id}")
    except Exception as e:
        logging.error(f"Error processing job {job['job_url_linkedin']}: {e}")
