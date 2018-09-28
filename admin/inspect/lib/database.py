import pycouchdb

# setup database connector
uri = "https://37bd9e99-2780-4965-8da8-b6b1ebb682bc-bluemix.cloudant.com"
server = pycouchdb.Server(uri, verify=True)
db = server.database("lantern-us-demo")