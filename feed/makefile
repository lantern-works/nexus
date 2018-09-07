MAKEFLAGS += --warn-undefined-variables
SHELL := /bin/bash

APP_ID := lantern-nexus-feed
.PHONY: run

run:
	npm start

env: 
	ibmcloud cf set-env ${APP_ID} CLOUDANT_API_KEY ${CLOUDANT_API_KEY}
	ibmcloud cf set-env ${APP_ID} CLOUDANT_API_PASS ${CLOUDANT_API_PASS}
	ibmcloud cf restage ${APP_ID}

deploy:
	ibmcloud login
	ibmcloud target --cf-api https://api.ng.bluemix.net -o west@paperequator.com -s dev
	ibmcloud cf push
