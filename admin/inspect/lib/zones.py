# returns disaster zones based on geolocation so we group related data
import time
from lib.database import db
from lib.geocode import getNameFromGeohash

zones = {}


def getSuppliesForVenue(venue_id):
    return db.query("venue/by_item", reduce=False, startkey=[ venue_id ], endkey=[ venue_id, {}, {}])

def getRoutes(geo_area):
    matching_routes = []
    routes = db.query("route/by_geo")
    for item in routes:
        did_match = False
        if item['value']['gp']:
            for point in item['value']['gp']:
                if point[:3] == geo_area:
                    did_match = True
        if did_match:
            matching_routes.append(item['value'])
    return matching_routes

def getOne(geo_area):
    return buildObject(search=geo_area)[geo_area]

def getAll():
    return buildObject()


def buildObject(search=""):

    venues = db.query("venue/by_geo")

    for item in venues:
        full_geohash = item['key'][1]
        geo_area = full_geohash[:3]
        
        if search == "" or geo_area == search:

            if not geo_area in zones:
                zones[geo_area] = {}
                zones[geo_area].update({
                    "name": getNameFromGeohash(full_geohash),
                    "places": [], 
                    "vehicles": [], 
                    "supplies": [], 
                    "routes": getRoutes(search)
                })

            if item['value']['ct'] and 'trk' in item['value']['ct']:
                zones[geo_area]['vehicles'].append(item['value'])
            else:
                zones[geo_area]['places'].append(item['value'])


            time.sleep(0.3)
            items = getSuppliesForVenue(item['value']['_id'])
            if items:
                for item in items:
                    zones[geo_area]['supplies'].append(item['value'])

    return zones