from lib.database import getDocsForEvents
from lib.csvmaker import writeCSV

grouped_docs = getDocsForEvents(["e:boston_D392F"])

for kind, docs in grouped_docs.items():
	print(kind + "--------")
	for doc in docs:
		print(doc)
		print("\n")
	print("\n\n")


writeCSV("boston_flood_run.csv", grouped_docs)