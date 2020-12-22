
import os

cors_allowed_origins = os.environ["CORS_ALLOWED"]
host = os.environ["HOST"]
port = int(os.environ['PORT'])
upload_folder = os.environ["UPLOAD_FOLDER"]
db_server_url = os.environ["DB_SERVER_URL"]

from .__main__ import app