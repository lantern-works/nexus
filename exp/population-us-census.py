import requests

# https://api.census.gov/data.html
year="2016"
dataset="pep/charagegroups"
uri='/'.join(["https://api.census.gov/data", year, dataset])
query="?get=GEONAME,POP&for=state"
print(uri+query)

# get population for target geohash
r = requests.get(uri+query)
results = r.json()
results.pop(0)
total_pop = 0

for row in results:
    name=row[0]
    population= round(float(row[1])/1000000, 2)
    total_pop += population
    print(name)
    print(str(population) + "m")
    print("-----")

print("Total Reported: " + str(total_pop))