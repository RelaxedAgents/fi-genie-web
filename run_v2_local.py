"""Run v2 API locally with aggressive SSL disabling."""

# CRITICAL: Disable SSL verification BEFORE any imports
import os
import ssl

# Completely disable SSL verification
ssl._create_default_https_context = ssl._create_unverified_context

# Set environment variables to completely disable SSL verification
os.environ["PYTHONHTTPSVERIFY"] = "0"
os.environ["REQUESTS_CA_BUNDLE"] = ""
os.environ["CURL_CA_BUNDLE"] = ""
os.environ["SSL_CERT_FILE"] = ""
os.environ["GRPC_DEFAULT_SSL_ROOTS_FILE_PATH"] = ""
os.environ["GRPC_SSL_CIPHER_SUITES"] = "ALL"
os.environ["GOOGLE_API_USE_CLIENT_CERTIFICATE"] = "false"
os.environ["GOOGLE_API_USE_MTLS_ENDPOINT"] = "never"
os.environ["GRPC_TLS_DISABLE_VERIFICATION"] = "1"

# Now load other configurations
from dotenv import load_dotenv
load_dotenv()

import sys
import subprocess

# Set environment variables to use the authenticated credentials
os.environ["GOOGLE_CLOUD_PROJECT"] = "direct-abacus-466910-b8"
os.environ["GCP_PROJECT_ID"] = "direct-abacus-466910-b8"
os.environ["GCP_LOCATION"] = "asia-south1"

# Add a flag to skip quota project validation
os.environ["GOOGLE_CLOUD_QUOTA_PROJECT"] = "direct-abacus-466910-b8"

# Force direct API mode
os.environ["GEMINI_PROVIDER"] = "direct"

print("Starting Financial AI Assistant v2...")
print(f"Project: {os.environ['GCP_PROJECT_ID']}")
print(f"Location: {os.environ['GCP_LOCATION']}")
print("SSL verification completely disabled for development")

# Run the v2 API
subprocess.run([sys.executable, "-m", "api.main_v2"])
