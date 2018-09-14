MAKEFLAGS += --warn-undefined-variables
SHELL := /bin/bash

APP_ID := lantern-nexus-web
.PHONY: run

run:
	npm start

env: 
	ibmcloud cf set-env ${APP_ID} WATSON_USERNAME ${WATSON_USERNAME}
	ibmcloud cf set-env ${APP_ID} WATSON_PASSWORD ${WATSON_PASSWORD}
	ibmcloud cf restage ${APP_ID}



deploy:
	ibmcloud login
	ibmcloud target --cf-api https://api.ng.bluemix.net -o west@paperequator.com -s dev
	ibmcloud cf push