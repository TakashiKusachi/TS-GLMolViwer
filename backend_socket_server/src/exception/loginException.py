from fastapi import FastAPI, Request
from starlette.responses import JSONResponse

class LoginErrorException(Exception):
    def __init__(self):
        pass
