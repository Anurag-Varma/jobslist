from jobspy import scrape_jobs
import requests
from datetime import datetime
import pandas as pd
import json
import re
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

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
        response = requests.post(url, headers=headers, data=payload)
        return response.headers["Set-Cookie"].split(';')[0]
    except Exception as e:
        print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S,%f')[:-3]} Failed to get cookie: {e}")
        return None

def send_post_request_to_add_jobs(job_data, cookie):
    try:
        url = 'https://api-v1.jobslist.live/api/jobs/addJob'
        headers = {
            'Referer': 'https://www.jobslist.live',
            'Content-Type': 'application/json',
            'Cookie': cookie
        }
        response = requests.post(url, headers=headers, data=job_data)

        return response
    except Exception as e:
        return None

def remove_url_hash(input_string):
    pattern = r'&urlHash=.*$'
    cleaned_string = re.sub(pattern, '', input_string)
    return cleaned_string

def scrape_and_post_jobs(role, cookie):
    # Scrape jobs for a specific role
    jobs = pd.DataFrame()
    try:
        jobs = scrape_jobs(
            site_name=["linkedin"],
            search_term=role,
            location="United States",
            results_wanted=100,
            hours_old=24 * 1,  # Only Linkedin/Indeed is hour specific, others round up to days old
            country_indeed='USA',  # Only needed for indeed / glassdoor
            description_format='html',
            linkedin_fetch_description=True,  # Get full description, direct job URL, company industry, and job level for LinkedIn
        )
        print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S,%f')[:-3]} Found {len(jobs)} jobs for role: {role}")
    except Exception as e:
        print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S,%f')[:-3]} Error scraping jobs for role {role}: {e}")

    # Iterate through jobs and send POST requests
    for index, job in jobs.iterrows():
        try:
            # Skip jobs with empty logo_photo_url or description
            if pd.isna(job["logo_photo_url"]) or pd.isna(job["description"]):
                continue

            # Set job location to "United States" if empty
            job_location = job["location"] if not pd.isna(job["location"]) else "United States"
            if job_location == "":
                job_location = "United States"

            # Determine job easy apply and job URL
            job_easy_apply = "false"
            job_url_direct = remove_url_hash(job["job_url_direct"]) if not pd.isna(job["job_url_direct"]) else ""
            if job_url_direct == "":
                job_url_direct = job["job_url"]
                job_easy_apply = "true"

            # Set date posted to today's date if empty
            date_posted = str(job["date_posted"]) if not pd.isna(job["date_posted"]) else ""
            if date_posted == "":
                today = datetime.today()
                date_posted = str(today.strftime('%m/%d/%Y'))

            # Set job level to "others" if "not applicable"
            job_level = job["job_level"] if job["job_level"] != "not applicable" else "Others"

            if job_level == "internship":
                job_level = "Internship"
            elif job_level == "entry level":
                job_level = "Entry Level"
            elif job_level == "mid-senior level":
                job_level = "Mid-Senior Level"
            elif job_level == "associate":
                job_level = "Associate"
            elif job_level == "director":
                job_level = "Director"
            elif job_level == "executive":
                job_level = "Executive"

            job_type = job["job_type"]
            if job_type == "fulltime":
                job_type = "Full-Time"
            elif job_type == "parttime":
                job_type = "Part-Time"
            elif job_type == "contract":
                job_type = "Contract"
            elif job_type == "internship":
                job_type = "Internship"
            elif job_type == "temporary":
                job_type = "Temporary"
            elif job_type == "volunteer":
                job_type = "Volunteer"
            elif job_type == "others" or job_type == "other":
                job_type = "Others"

            job_data = {
                "job_url_direct": job_url_direct,
                "job_url_linkedin": job["job_url"],
                "job_title": job["title"],
                "job_company": job["company"],
                "job_location": job_location,
                "job_type": job_type,
                "job_date_posted": date_posted,
                "job_experience_level": job_level,
                "job_function": job["job_function"],
                "job_company_industry": job["company_industry"],
                "job_description": job["description"],
                "job_company_linkedin_url": job["company_url"],
                "job_company_logo": job["logo_photo_url"],
                "job_easy_apply": job_easy_apply,
                "job_active": "true"
            }

            response = send_post_request_to_add_jobs(json.dumps(job_data), cookie)
            if response and (response.status_code == 200 or response.status_code == 201):
                print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S,%f')[:-3]} Job added: {job['title']}")
            else:
                print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S,%f')[:-3]} Failed to add job: {job['title']}")
        except Exception as e:
            print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S,%f')[:-3]} Error processing job {job['title']}: {e}")

# List of job roles to scrape
roles = [
    "Software Engineer",
    "Full Stack Developer",
    "Frontend Developer",
    "Backend Developer",
    "Machine Learning Engineer",
    "API Developer"
]

# Get the authentication cookie
cookie = send_post_to_get_cookie()

# Iterate through the list of roles and perform the operation
for role in roles:
    scrape_and_post_jobs(role, cookie)
