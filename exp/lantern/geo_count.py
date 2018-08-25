from lib.database import db

# count total for each type of document
map_func = "function(doc) { if (doc.hasOwnProperty('gp') && typeof(doc.gp) == 'object') { for (var idx in doc.gp) { emit(doc.gp[idx].substr(0,2), 1); } } }"
reduce_func = "_count"

results = db.temporary_query(map_func, reduce_func, group=True)

for item in results:
	print(item)