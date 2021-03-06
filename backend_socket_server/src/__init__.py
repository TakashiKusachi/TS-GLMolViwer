
import os

cors_allowed_origins = os.environ["CORS_ALLOWED"]
host = os.environ["HOST"]
port = int(os.environ['PORT'])
upload_folder = os.environ["UPLOAD_FOLDER"]
db_server_url = os.environ["DB_SERVER_URL"]
cookie_time = os.environ["COOKIE_TIME"]
secret_key = os.environ["SECRET_KEY"]


from .__main__ import app