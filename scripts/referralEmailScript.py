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
            'Cookie': '_ps_xid_UhXtEvJi_swfz=pxJxqo8rDkzS39;_ps_partner_key_UhXtEvJi=editorialdepartment9381;_ps_xid_UhXtEvJi_aGEK=U2HoUfn4XtrrAC;_gsxidUhXtEvJibUIe=tRSRPQDr3RqkWs;_grsmpkUhXtEvJi=editorialdepartment9381;_gsxidUhXtEvJijSnP=NG0AsHtbBSjFLI;_gsxidUhXtEvJieJXJ=pxJxqo8rDkzS39;_gsxidUhXtEvJipQVg=EE6Fi0hWcxMXHQ;ZP_LATEST_LOGIN_PRICING_VARIANT=24Q3_W59_V2;ZP_Pricing_Split_Test_Variant=24Q3_W59_V2;__cf_bm=jLl8h5abr7WeIiXuojSz8g_RpgmOSfjnLYLbvt9kQ4s-1730164949-1.0.1.1-wchgy4W2S1bCqH28mnsYjuEvsgVpMsEb1CvDGoPZdzZXbQTPjN.s9nrC8by4HX9VlNI3lh0FIopULu23bHJRNg;_gsxidUhXtEvJi01UG=TnudC8JN9AUygR;_gsxidUhXtEvJiXINT=1PNSEJfZrUAcru;_ps_xid_UhXtEvJi_0D7Z=TnudC8JN9AUygR;_ps_xid_UhXtEvJi_9hGB=EE6Fi0hWcxMXHQ;_gsxidUhXtEvJivn1l=U2HoUfn4XtrrAC;_ps_xid_UhXtEvJi_YWoA=NG0AsHtbBSjFLI;_ps_xid_UhXtEvJi_pzo0=tRSRPQDr3RqkWs;_ps_xid_UhXtEvJi_Bmh5=Z8OxobitTIo5LQ;_gsxidUhXtEvJiJfJB=9qYikNrvgNuloy;_gsxidUhXtEvJiWwDK=Z8OxobitTIo5LQ;_hjSessionUser_3601622=eyJpZCI6IjU1ZmNiMTg3LWRiNTAtNWViNS1iYmY3LWM1MTViMGFlN2E3MyIsImNyZWF0ZWQiOjE3Mjc0MTQ2MzY1NDAsImV4aXN0aW5nIjp0cnVlfQ==;_leadgenie_session=4Vf2nH1NAHHJEYocTobIzCSQNhuj2qSc%2FznZOtm8eiV2btdSwwD2s%2BQEgCmZ7MoY4eZNZZ6qqhNpI7lQDTTAJymcNBO7ikKYbpQmcOi4BCPc%2BEXxwqlb3TW%2Fs%2F9k4QPYPCM1LrlVAIDyP0bD7kHl%2FwovZJeZa35oV4gLJ3fcCtV8AqzVsP6bfunRCTEhvcJwK%2BZ%2Bz%2B4tDwl9eCkT3LXOJ%2BPBulM%2BtsZGVgRCJCA4bVKdc0NJzcqc74I3mBLwms9fIS1%2BakaVW8vTMGP4gnfCz4GAlzS3wyK89VA%3D--arf27ugzbcNnFXDR--5TmiSGN%2F22v0ydg34nVKzA%3D%3D;_ps_xid_UhXtEvJi_BYAi=9qYikNrvgNuloy;_ps_xid_UhXtEvJi_fGQh=1PNSEJfZrUAcru;remember_token_leadgenie_v2=eyJfcmFpbHMiOnsibWVzc2FnZSI6IklqWTJaall4WmpGaFpHRTJaVEZpTURFNVlqazNObU16T0Y5c1pXRmtaMlZ1YVdWamIyOXJhV1ZvWVhOb0lnPT0iLCJleHAiOiIyMDI0LTExLTI5VDAxOjMyOjMwLjgxM1oiLCJwdXIiOiJjb29raWUucmVtZW1iZXJfdG9rZW5fbGVhZGdlbmllX3YyIn19--1cadd1ec976945a76d73a3fcf73ec771b7bbcc81;X-CSRF-TOKEN=Q7tnahZRWdV2NGAsdIIvKEcb0N8i4rO1_N6YH2HC5IpI4_taugQcloRAID20tBobaAKhW0zcdP5G7A1t6tmqEQ',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty'
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

        with ThreadPoolExecutor(max_workers=5) as executor:
            apollo_futures = []
            for i in range(0, len(linkedin_profiles), 10):
                batch_profiles = linkedin_profiles[i:i + 10]
                batch_profile_info = profile_info_list[i:i + 10]
                apollo_futures.append(executor.submit(batch_send_apollo, batch_profiles, batch_profile_info))
            
            # Ensure all Apollo requests finish
            for future in as_completed(apollo_futures):
                future.result()

    # Main function to handle the overall workflow
    def main_function(api, company, region, job_link="", job_title="", limit=20):
        process_linkedin_profiles(api, company, region, job_link, job_title, limit)

    main_function(api, company, "103644278", job_link, job_title, limit=20)

    # Output result as JSON
    print(json.dumps(result))

if __name__ == "__main__":
    main()
