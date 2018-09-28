from lib.database import server,db

# echo basic server info
print(server.info())

# print actual documents
for item in db.all():
	print(item['doc'])