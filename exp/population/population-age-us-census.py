import requests,pprint


pp = pprint.PrettyPrinter(depth=6)

# https://api.census.gov/data.html
year="2017"
dataset="pep/charage"
uri='/'.join(["https://api.census.gov/data", year, dataset])
query="?get=AGE,POP,GEONAME&for=state"
print(uri+query) 

# get population for target geohash
r = requests.get(uri+query)
results = r.json()
results.pop(0)
total_pop = 0

for row in results:
    pp.pprint(row)

print("Total Reported: " + str(total_pop))