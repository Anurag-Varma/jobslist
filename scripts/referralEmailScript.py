import sys
import json
import requests
from linkedin_api import Linkedin
from requests.cookies import RequestsCookieJar, create_cookie
from concurrent.futures import ThreadPoolExecutor, as_completed

def main():
    # Extract arguments from the command line
    company = sys.argv[1]
    job_link = sys.argv[2]
    jsonCookies = sys.argv[3]
    emailText = sys.argv[4]
    job_title = sys.argv[5]
    job_company_linkedin_url = sys.argv[6]

    result = {"error": [], "data": []}
    cookies = json.loads(jsonCookies)

    # Initialize a cookie jar
    cookie_jar = RequestsCookieJar()

    # Populate cookie jar with cookies from JSON
    for cookie_data in cookies:
        cookie = create_cookie(
            domain=cookie_data.get("domain"),
            name=cookie_data.get("name"),
            value=cookie_data.get("value"),
            path=cookie_data.get("path", "/"),
            secure=cookie_data.get("secure", False),
            expires=cookie_data.get("expirationDate", None),
            rest={
                "HttpOnly": cookie_data.get("httpOnly", False),
                "SameSite": cookie_data.get("sameSite", "unspecified"),
                "HostOnly": cookie_data.get("hostOnly", False),
            }
        )
        cookie_jar.set_cookie(cookie)

    # Initialize Linkedin API object with cookie jar
    api = Linkedin("", "", cookies=cookie_jar)

    # Define headers for Apollo API

    def get_headers():
        return{
            'extension-version': '8.3.4',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
            'Content-Type': 'application/json',
            'client-origin': 'linkedin',
            'Origin': 'chrome-extension://alhgpfoeiimagjlnfekdhkjlkiomcapa',
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'en-US,en;q=0.9',
            'Connection': 'keep-alive',
            'DNT': '1',
            'Cookie': 'ZP_LATEST_LOGIN_PRICING_VARIANT=24Q3_W59_V2;ZP_Pricing_Split_Test_Variant=24Q3_W59_V2;__cf_bm=J4NvOSKN8pa8PQJuGb3ZDMLyXOJgGiFGTx12chh_6WQ-1731903229-1.0.1.1-WN5tYmwJgTqq4q9upG1neTE47j9lwEi66VtF8bhXYfqmINqaSszdLwgGsGXHPKWCdFY.iZMDwopANG7r9JruwQ;_leadgenie_session=TOHiyCcBr6zlH31BiTlzl1XqK00Io%2Fon6jLd9bqrJ6%2FlbmWkfZhH7Kmi%2F5jlRmoOz%2FPPmiQUgTZ5EP7LAm9f045xgbmg2i7A5RFklohpVCJzrhDTUM4tSGAAzna25vWeoHVfBI3zmkXAypOv4nXEOcK9xn%2BTi7cnpTO1vdpwegbL8YSCKqByUrd98hly436HOXa637eKWZvH7CMVhyjPRUY7zeDHtK2a1mYp7TvcNrRCA8WK9P6b0raSnNRh%2B955LSt4l5j5TahsJLIpSJ1u1KCW2gdzJp0jks0%3D--oYHnlk%2FMjqzIaSX0--cGREKY8i9mhi91%2BQISAHfw%3D%3D;remember_token_leadgenie_v2=eyJfcmFpbHMiOnsibWVzc2FnZSI6IklqWTNNelUwTmpnNFlqazFZV05tTURGaU1HUXdOakJqWVY5ak9EUTFaVGs0TVRjNE1ETTJaVFV5WmpCa1pqQXpOV1poTVdNeFlUaGlPQ0k9IiwiZXhwIjoiMjAyNC0xMi0xNFQwMzoyOToyNC4wNTFaIiwicHVyIjoiY29va2llLnJlbWVtYmVyX3Rva2VuX2xlYWRnZW5pZV92MiJ9fQ%3D%3D--bc0014d4e7a0119e8d51f7709830e42f1d90c868;X-CSRF-TOKEN=aOgmxXQyHLiCzuSg_8tkuGyDiM_5KplfLs8DgIDhaIphmJMRL-rKkK89qIu6dI-JZ0UdrvKkBPLBgaU2JCJXWg',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Host': 'app.apollo.io'
        }

    # Define Apollo API URL
    APOLLO_URL = "https://app.apollo.io/api/v1/linkedin_chrome_extension/parse_search_page"

    # Fetch LinkedIn profiles based on company and title in bulk
    def fetch_linkedin_profiles(api, company, search_job_title, region, limit=20):
        return api.search_people(keyword_company=company, keyword_title=search_job_title, regions=[region], limit=limit)

    # Make the POST request to the Apollo API
    def send_apollo_request(profiles, headers):
        payload = {
            "url": "https://www.linkedin.com/search/results/people",
            "linkedin_people": profiles
        }
        response = requests.post(APOLLO_URL, json=payload, headers=headers)
        if response.status_code != 200:
            result["error"].append(response.text)
            return None
        try:
            return response.json()
        except ValueError:
            result["error"].append(response.text)
            return None

    # Email template generator
    def create_email_template(PERSON_NAME, JOB_TITLE, JOB_LINK, COMPANY):
        return emailText.format(PERSON_NAME=PERSON_NAME, JOB_TITLE=JOB_TITLE, JOB_LINK=JOB_LINK, COMPANY=COMPANY)

    # Extract and generate emails for contacts from Apollo response
    def extract_and_send_email(data, profile_info_list, job_link, company):
        if not data or 'contacts' not in data:
            return
        for i, contact in enumerate(data['contacts']):
            name = contact['name']
            email = contact['email']
            email_status = contact.get('email_status', '')
            public_id = profile_info_list[i]['public_id']
            job_title = profile_info_list[i]['job_title']
            linkedin_profile_url = f"https://www.linkedin.com/in/{public_id}"

            if email_status == "verified":
                email_content = create_email_template(name, job_title, job_link, company)
                result["data"].append({
                    "name": name,
                    "email": email,
                    "linkedin_profile_url": linkedin_profile_url,
                    "email_content": email_content,
                    "subject": f"Referral for {job_title} role at {company}"
                })

    # Process LinkedIn profiles with concurrency
    def process_linkedin_profiles(api, company, region, job_link, job_title, limit=20):
        linkedin_profiles = []
        profile_info_list = []
        headers = get_headers()
        
        combined_profiles_set = set()

        # Fetch "Software" and "Senior Software" profiles concurrently
        with ThreadPoolExecutor(max_workers=2) as executor:
            future_software = executor.submit(fetch_linkedin_profiles, api, company, "Software", region, limit)
            future_senior_software = executor.submit(fetch_linkedin_profiles, api, company, "Senior Software", region, limit)

            software_profiles = future_software.result()
            senior_software_profiles = future_senior_software.result()

            # Add results to the set to avoid duplicates
            for profile in software_profiles:
                combined_profiles_set.add(frozenset(profile.items()))

            for profile in senior_software_profiles:
                combined_profiles_set.add(frozenset(profile.items()))

        # Convert set of profiles back into a list of dictionaries
        combined_profiles = [dict(profile) for profile in combined_profiles_set]

        def fetch_profile_data(data):
            urn_id = data["urn_id"]
            try:
                public_id = api.get_profile(urn_id=urn_id)["public_id"]
                return {"public_id": public_id, "job_title": job_title}
            except Exception as e:
                result["error"].append(str(e))
                return None

        # Fetch LinkedIn profile details concurrently
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(fetch_profile_data, data) for data in combined_profiles]
            for future in as_completed(futures):
                profile = future.result()
                if profile:
                    linkedin_profiles.append({"href": f"https://www.linkedin.com/in/{profile['public_id']}"})
                    profile_info_list.append(profile)

        # Split into batches and send Apollo requests concurrently
        def batch_send_apollo(batch_profiles, batch_profile_info):
            response_data = send_apollo_request(batch_profiles, headers)
            extract_and_send_email(response_data, batch_profile_info, job_link, company)

        with ThreadPoolExecutor(max_workers=4) as executor:
            apollo_futures = []
            for i in range(0, len(linkedin_profiles), 20):
                batch_profiles = linkedin_profiles[i:i + 20]
                batch_profile_info = profile_info_list[i:i + 20]
                apollo_futures.append(executor.submit(batch_send_apollo, batch_profiles, batch_profile_info))
            
            # Ensure all Apollo requests finish
            for future in as_completed(apollo_futures):
                future.result()

    def fetch_profiles_and_add_to_list( job_company_linkedin_url, job_title, job_link, company):
        # Static data and API URLs
        APOLLO_GET_ORGANIZATION_ID ="https://app.apollo.io/api/v1/linkedin_chrome_extension/parse_company_page"
        APOLLO_URL_GET_ALL_PROFILES = "https://app.apollo.io/api/v1/mixed_people/search"
                        
        headers = get_headers()  
        
        payload = {"url": job_company_linkedin_url,
        "html":"""
                <div class=\"org-top-card__primary-content\">
                    <h1 class=\"ember-view org-top-card-summary__title\"> test </h1>   
                    <div class=\"org-top-card-summary-info-list\">  	  
                        test 
                    </div>
                </div>""",
        "language_code":"en"
        }
        
        try:
            response = requests.post(APOLLO_GET_ORGANIZATION_ID, json=payload, headers=headers)

            organization_data=response.json()

            if organization_data is None or "organization" not in organization_data:
                return

            organization_id=organization_data["organization"]["id"]
            
            roles = [
                        "senior software engineer", "hiring manager", "software engineering manager", "lead software engineer",
                        "lead software developer", "head of engineering", "software engineer", "software developer", 
                        "technical recruiter", "senior director", "director of engineering", "director of technology", 
                        "talent acquisition manager", "Technical Product Manager", "hiring", "talent acquisition", 
                        "talent acquisition specialist", "human resources manager", "People Operations Manager", 
                        "Vice President of Technology", "Vice President of Engineering", "Vice President of Product", 
                        "Chief Technology Officer", "Chief Information Officer", "Chief Product Officer", 
                        "Senior Director of Software Development", "Principal Software Engineer", "Distinguished Engineer", 
                        "Lead Software Engineer", "Head of Technology", "Senior Program Manager", 
                        "talent acquisition partner", "human resources", "talent acquisition team", 
                        "Talent Acquisition Leader", "founder", "managing director", "president", "co-founder"        
                    ]

            payload = {
                "page": str(1),
                "contact_email_status_v2": ["likely_to_engage", "verified"],
                "sort_by_field": "[none]",
                "sort_ascending": "False",
                "person_locations": ["United States"],
                "organization_ids": [organization_id],
                "person_titles": roles,
                "display_mode": "explorer_mode",
                "per_page": 25,
                "num_fetch_result": 1,
                "context": "people-index-page",
                "show_suggestions": "false"
            }
        
            # Fetch profiles from Apollo API
            response = requests.post(APOLLO_URL_GET_ALL_PROFILES, json=payload, headers=headers)
            if response.status_code != 200:
                result["error"].append(response.text)

            data = response.json()
            persons = data.get("people", [])
            
            linkedin_url_list=[]
            for person in persons:
                linkedin_url = person.get("linkedin_url")
                linkedin_url_list.append({"href": linkedin_url})
                
            data = send_apollo_request(linkedin_url_list, headers)
            
            if not data or 'contacts' not in data:
                return
            for i, contact in enumerate(data['contacts']):
                name = contact['first_name']
                email = contact['email']
                email_status = contact.get('email_status', '')
                

                # Only proceed if email is verified and company is allowed
                if email_status == "verified" :

                    def check_restricted_email(email):
                        restricted_domains = ['.gov', '.mil', '.edu']
                        return any(email.strip().lower().endswith(domain) for domain in restricted_domains)

                    if check_restricted_email(email):
                        continue
                    
                    email_content = create_email_template(name, job_title, job_link, company)
                    result["data"].append({
                        "name": name,
                        "email": email,
                        "linkedin_profile_url": linkedin_url_list[i]['href'],
                        "email_content": email_content,
                        "subject": f"Referral for {job_title} role at {company}"
                    })

        except Exception as e:
            result["error"].append(str(e))

    # Main function to handle the overall workflow
    def main_function(api, company, region, job_link="", job_title="", limit=20):
        process_linkedin_profiles(api, company, region, job_link, job_title, limit)

    if job_company_linkedin_url == "":
        main_function(api, company, "103644278", job_link, job_title, limit=20)
    else:
        fetch_profiles_and_add_to_list( job_company_linkedin_url, job_title, job_link, company)

    # Output result as JSON
    print(json.dumps(result))

if __name__ == "__main__":
    main()
