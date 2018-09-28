from lib.database import db

# count total for each type of document
map_func = "function(doc) { var type = doc._id[0]; emit(type, 1); }"
reduce_func = "_count"

results = db.temporary_query(map_func, reduce_func, group=True)

for item in results:
	print(item)