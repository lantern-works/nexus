from lib.database import getDocsForEvents
from lib.csvmaker import writeCSV


grouped_docs = getDocsForEvents(["e:boston_X8E29", "e:boston_19EC4"])

for kind, docs in grouped_docs.items():
	print(kind + "--------")
	for doc in docs:
		print(doc)
		print("\n")

	print("\n\n")



writeCSV("boston_flood_training.csv", grouped_docs)