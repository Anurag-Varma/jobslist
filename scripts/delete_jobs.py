from utils import create_session
from bs4 import BeautifulSoup
import requests
import json
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed

# Load environment variables
load_dotenv()

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

def _get_job_details(job_id, error_count, _id) -> bool:
    try:
        response = session.get(
            f"{base_url}/jobs-guest/jobs/api/jobPosting/{job_id}", timeout=5
        )
        if response.status_code == 404:
            if error_count < 3:
                error_count += 1
                
                url = os.getenv("REACT_APP_BACKEND_API_URL")+"/api/jobs/updateJob"

                headers = {
                    'Referer': 'https://www.jobslist.live',
                    'Content-Type': 'application/json',
                    'Cookie': cookie
                }

                response = requests.request("PUT", url, headers=headers, json={"jobId": _id, "jobData": {"error_count": error_count}})

                if response.status_code == 200:
                    return False, error_count
                elif response.status_code == 404:
                    return True, error_count
            else:
                return True, error_count
        response.raise_for_status()
    except Exception as e:
        print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S,%f')[:-3]}+Failed to get job details for {job_id}: {e}")
        return False, error_count
    
    if "linkedin.com/signup" in response.url:
        print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S,%f')[:-3]} Redirected to signup page for {job_id}")
        return False, error_count

    soup = BeautifulSoup(response.text, "html.parser")

    div_content = soup.find(
        "figure", class_=lambda x: x and "closed-job" in x
    )

    apply_button = soup.find("button", class_="apply-button")

    if div_content or apply_button  is None:
        return True, error_count

    return False, error_count

def send_post_to_get_cookie():
    try:
        url = os.getenv("REACT_APP_BACKEND_API_URL")+"/api/users/login"

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
        print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S,%f')[:-3]} Failed to get cookie: {e}")
        return None

cookie = send_post_to_get_cookie()

def get_job_ids():
    try:
        url = os.getenv("REACT_APP_BACKEND_API_URL")+"/api/jobs/getJobIds"

        headers = {
            'Referer': 'https://www.jobslist.live',
            'Content-Type': 'application/json',
            'Cookie': cookie
        }

        response = requests.request("GET", url, headers=headers)

        return response.json()["jobs"]
    except Exception as e:
        print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S,%f')[:-3]} Failed to get job IDs: {e}")
        return []

def delete_job(job_id):
    try:
        url = os.getenv("REACT_APP_BACKEND_API_URL")+"/api/jobs/deleteJob"

        headers = {
            'Referer': 'https://www.jobslist.live',
            'Content-Type': 'application/json',
            'Cookie': cookie
        }

        response = requests.request("POST", url, headers=headers, json={"jobId": job_id})

        return response
    except Exception as e:
        print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S,%f')[:-3]} Failed to delete job {job_id}: {e}")
        return None

def process_job(job):
    try:
        job_id = job["job_url_linkedin"].split('/')[-1]
        created_at = datetime.strptime(job["createdAt"], '%Y-%m-%dT%H:%M:%S.%fZ')
        error_count = job.get("error_count", 0)
        
        # Check if the job's createdAt date is more than 7 days old
        if datetime.now() - created_at > timedelta(days=8):
            response = delete_job(job["_id"])
            if response:
                print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S,%f')[:-3]} Deleted job: {job_id} (older than 7 days)")
            else:
                print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S,%f')[:-3]} Failed to delete job (older than 7 days): {job_id}")
        else:
            status, error_count=_get_job_details(job_id, error_count, job["_id"])
            if status:
                response = delete_job(job["_id"])
                if response:
                    print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S,%f')[:-3]} Deleted job: {job_id}")
            else:
                print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S,%f')[:-3]} Not deleted (job might be open, count {error_count}): {job_id}")
                
    except Exception as e:
        print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S,%f')[:-3]} Failed to delete job {job['job_url_linkedin']}: {e}")

jobs = get_job_ids()
print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S,%f')[:-3]} Found {len(jobs)} jobs")

# Use ThreadPoolExecutor to process jobs concurrently
with ThreadPoolExecutor(max_workers=5) as executor:
    futures = [executor.submit(process_job, job) for job in jobs]
    for future in as_completed(futures):
        future.result()  # Handle any exceptions raised
