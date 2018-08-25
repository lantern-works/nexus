import pycouchdb

# setup database connector
uri = "https://lantern.global/db/"
server = pycouchdb.Server(uri, verify=True)
db = server.database("lnt")