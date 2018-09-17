import os,pycouchdb

# setup database connector
uri = "https://" + os.environ['CLOUDANT_API_KEY'] + ":" + os.environ['CLOUDANT_API_PASS'] + "@37bd9e99-2780-4965-8da8-b6b1ebb682bc-bluemix.cloudant.com"
server = pycouchdb.Server(uri, verify=True)
db = server.database("lantern-boston-flood-scenario")


key_map = {
	"v": "venues",
	"r": "routes",
	"i": "items"
}



def hasParent(doc, event_list):
	parent_match = False
	print(event_list, doc)
	for event_id in event_list:
		if event_id in doc["pt"]:
			parent_match = True
	return parent_match

def getDocsForEvents(event_list):
	all_docs = db.all()

	data = {
		"events": [],
		"venues": [],
		"items": [],
		"routes": []
	}

	for row in all_docs:
		doc = row["doc"]

		# events that match requested event ids
		if doc["_id"][0] == "e":
			if doc["_id"] in event_list:
				data["events"].append(doc)

		# all other documents that have events as a parent
		elif hasParent(doc, event_list):
			data[key_map[doc["_id"][0]]].append(doc)

	return data