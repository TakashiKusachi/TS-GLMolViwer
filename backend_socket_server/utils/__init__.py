

def parse_cors_allowd(environment_variable:str):
    
    if environment_variable == "" or environment_variable == "*":
        return "*"
    else:
        return environment_variable.split(";")

