# script.py
import sys
import json

def main():
    # Extract arguments from the command line
    company = sys.argv[1]
    job_link = sys.argv[2]

    # Simulate some processing and return a response
    result = {
        "message": f"Processing referral for {company} at {job_link}",
        "status": "success"
    }
    
    # Print the result as JSON (stdout to be captured by Node.js)
    print(json.dumps(result))

if __name__ == "__main__":
    main()
