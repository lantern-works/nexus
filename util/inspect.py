import pycouchdb

# setup database connector
uri = "https://lantern.global/db/"
server = pycouchdb.Server(uri, verify=True)
db = server.database("lantern")

# count total for each type of document
map_func = "function(doc) { var type = doc._id[0]; emit(type, 1); }"
reduce_func = "_count"
print(list(db.temporary_query(map_func, reduce_func, group=True)))
