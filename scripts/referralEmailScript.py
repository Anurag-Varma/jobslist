# script.py
import sys
import json
from requests.cookies import RequestsCookieJar, create_cookie
from linkedin_api import Linkedin
import json
import requests
import os

def main():
    # Extract arguments from the command line
    company = sys.argv[1]
    job_link = sys.argv[2]
    jsonCookies = sys.argv[3]
    emailText = sys.argv[4]

    result = {}
    result["error"] = []
    result["data"] = []
    
    # script_dir = os.path.dirname(os.path.abspath(__file__))

    # Construct the path to cookies.json
    # cookies_path = os.path.join(script_dir, 'cookies.json')

    # Load cookies from JSON file
    # cookies = json.load(open(cookies_path))
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

    # Define headers
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
            'Cookie': 'hubspotutk=93e3289f002c5a236c4c50de3959b008; _cioanonid=f236a271-4c69-07c1-47b1-cbe1236a2028; _gcl_au=1.1.1684503114.1727414636; _ga=GA1.1.1588607074.1727414636; _tt_enable_cookie=1; _ttp=FOfaGLDIMqwrMjCNKv6FQ5U1lne; intercom-device-id-dyws6i9m=8321ab76-0b56-419f-87e8-6fa531d008f8; _cioid=66f61f1ada6e1b019b976c38; ZP_LATEST_LOGIN_PRICING_VARIANT=24Q3_W59_V2; ZP_Pricing_Split_Test_Variant=24Q3_W59_V2; _clck=a6ualv%7C2%7Cfpl%7C0%7C1731; __hssrc=1; _ps_xid_UhXtEvJi_Bmh5=Z8OxobitTIo5LQ; _ps_partner_key_UhXtEvJi=editorialdepartment9381; _gsxidUhXtEvJiWwDK=Z8OxobitTIo5LQ; _grsmpkUhXtEvJi=editorialdepartment9381; zp__initial_landing_page=https://www.apollo.io/sign-up; zp__utm_medium=partner; zp__initial_utm_medium=partner; zp__initial_utm_source=affiliates_partnerstack; zp__initial_utm_campaign=referrers_editorialdepartment9381; zp__initial_utm_gspartnerkey=editorialdepartment9381; pscd=get.apollo.io; _hjSessionUser_3601622=eyJpZCI6IjU1ZmNiMTg3LWRiNTAtNWViNS1iYmY3LWM1MTViMGFlN2E3MyIsImNyZWF0ZWQiOjE3Mjc0MTQ2MzY1NDAsImV4aXN0aW5nIjp0cnVlfQ==; remember_token_leadgenie_v2=eyJfcmFpbHMiOnsibWVzc2FnZSI6IklqWTJaall4WmpGaFpHRTJaVEZpTURFNVlqazNObU16T0Y5c1pXRmtaMlZ1YVdWamIyOXJhV1ZvWVhOb0lnPT0iLCJleHAiOiIyMDI0LTEwLTI5VDAxOjA2OjMxLjY0MVoiLCJwdXIiOiJjb29raWUucmVtZW1iZXJfdG9rZW5fbGVhZGdlbmllX3YyIn19--98b586f92a3430405db8e617e2998b72d0e0b12b; zp__initial_referrer=https://www.google.com/; zp__utm_source=affiliates_partnerstack; _ga_76XXTC73SP=GS1.1.1727581601.4.1.1727584595.60.0.1130300443; __hstc=21978340.93e3289f002c5a236c4c50de3959b008.1727414633934.1727581590341.1727590003593.5; _ps_xid_UhXtEvJi_0D7Z=TnudC8JN9AUygR; _gsxidUhXtEvJi01UG=TnudC8JN9AUygR; zp__utm_campaign=referrers_editorialdepartment9381; zp__gspk=ZWRpdG9yaWFsZGVwYXJ0bWVudDkzODE; zp__utm_gspartnerkey=editorialdepartment9381; growSumoPartnerKey=editorialdepartment9381; ps_partner_key=editorialdepartment9381; gsxid=TnudC8JN9AUygR; ps_xid=TnudC8JN9AUygR; _ps_xid_UhXtEvJi_aGEK=U2HoUfn4XtrrAC; _gsxidUhXtEvJivn1l=U2HoUfn4XtrrAC; zp__gsxid=U2HoUfn4XtrrAC; amplitude_id_122a93c7d9753d2fe678deffe8fac4cfapollo.io=eyJkZXZpY2VJZCI6ImE0MWVmNzQxLTNkMGItNDE1Yi1iYjc5LTk1YTRlYmI1ZGJmOFIiLCJ1c2VySWQiOiI2NmY2MWYxYWRhNmUxYjAxOWI5NzZjMzgiLCJvcHRPdXQiOmZhbHNlLCJzZXNzaW9uSWQiOjE3Mjc1OTAwMDIyMTIsImxhc3RFdmVudFRpbWUiOjE3Mjc1OTAyNTM2NTAsImV2ZW50SWQiOjYwLCJpZGVudGlmeUlkIjo2Niwic2VxdWVuY2VOdW1iZXIiOjEyNn0=; intercom-session-dyws6i9m=ODZoYU9uUXlEWmRzNUhsL0Q3aVdiejliVG4yNUNhTFFhd29CTnU5b29Wbk9saU12QVp1RHNkTmJJWkh4NWt1UC0tbW15aEIwTFhZVVk0czBUWG5Fang5UT09--7866aac7aad6cebd0eea4d1b23ff5055987a4f07; amp_91ff3d=OtfOPBZrSN4_zsVimAnsmK.NjZmNjFmMWFkYTZlMWIwMTliOTc2YzM4..1i8u6at9a.1i8u6llaj.p.4.t',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty'
        }

    # Define the URL of the Apollo API
    APOLLO_URL = "https://app.apollo.io/api/v1/linkedin_chrome_extension/parse_search_page"

    # Fetch the LinkedIn profiles based on company name and title
    def fetch_linkedin_profiles(api, company, job_title, region, limit=20):
        urn_ids_data = api.search_people(keyword_company=company, keyword_title=job_title, regions=[region], limit=limit)
        return urn_ids_data

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

    # Define the email template
    def create_email_template(PERSON_NAME, job_title, JOB_LINK, COMPANY):
        email_template = emailText.format(PERSON_NAME=PERSON_NAME, JOB_LINK=JOB_LINK, COMPANY=COMPANY)
        
        return email_template

    # Extract and print contact information from Apollo response and generate email
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
                # Generate the email using the template
                email_content = create_email_template(name, job_title, job_link, company)

                result["data"].append({
                    "name": name,
                    "email": email,
                    "linkedin_profile_url": linkedin_profile_url,
                    "email_content": email_content,
                    "subject": f"Referral for Software Engineer role at {company}"
                })
                


    # Main function to process LinkedIn profiles
    def process_linkedin_profiles(api, company, job_title, region, job_link, limit=20):
        linkedin_profiles = []
        profile_info_list = []
        headers = get_headers()

        urn_ids_data = fetch_linkedin_profiles(api, company, job_title, region, limit)

        for data in urn_ids_data:
            urn_id = data["urn_id"]
            job_title = data["jobtitle"]
            try:
                # Get the public_id for each urn_id
                public_id = api.get_profile(urn_id=urn_id)["public_id"]

                # Add profile details for batch processing
                linkedin_profiles.append({"href": f"https://www.linkedin.com/in/{public_id}"})
                profile_info_list.append({"public_id": public_id, "job_title": job_title})

                # Process in batches of 10
                if len(linkedin_profiles) == 10:
                    response_data = send_apollo_request(linkedin_profiles, headers)
                    extract_and_send_email(response_data, profile_info_list, job_link, company)

                    # Clear profiles for the next batch
                    linkedin_profiles.clear()
                    profile_info_list.clear()

            except Exception as e:
                result["error"].append(e.message)

        # Process remaining profiles if any
        if linkedin_profiles:
            response_data = send_apollo_request(linkedin_profiles, headers)
            extract_and_send_email(response_data, profile_info_list, job_link, company)

    # Function to be called with input parameters (company name, job title, region, and limit)
    def main_function(api, company, job_title, region,  job_link="", limit=20):
        process_linkedin_profiles(api, company, job_title, region, job_link,limit)

    # Example usage
    # company = "Interclypse"
    # job_link = "https://dc1prodrecruiting.paylocity.com/Recruiting/Jobs/Details/2764599/Interclypse-Inc"

    main_function(api, company, "Software", "103644278", job_link, limit=10)
        
    # Print the result as JSON (stdout to be captured by Node.js)
    print(json.dumps(result))

if __name__ == "__main__":
    main()
