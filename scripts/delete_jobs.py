from utils import create_session
from bs4 import BeautifulSoup




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
        """
        Retrieves job description and other job details by going to the job page url
        :param job_page_url:
        :return: dict
        """
        try:
            response = session.get(
                f"{base_url}/jobs-guest/jobs/api/jobPosting/{job_id}", timeout=5
            )
            response.raise_for_status()
        except Exception as e:
            print(e)
            return {}
        
        if "linkedin.com/signup" in response.url:
            return {}

        soup = BeautifulSoup(response.text, "html.parser")
        div_content = soup.find(
            "figure", class_=lambda x: x and "closed-job" in x
        )

        if div_content:
             return True

        return False
  
print(_get_job_details("3986733752"))