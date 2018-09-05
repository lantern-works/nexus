MAKEFLAGS += --warn-undefined-variables
SHELL := /bin/bash

.PHONY: run

run:
	npm start

env: 
	ibmcloud cf set-env lantern-nexus-web CLOUDANT_API_KEY ${CLOUDANT_API_KEY}
	ibmcloud cf set-env lantern-nexus-web CLOUDANT_API_PASS ${CLOUDANT_API_PASS}
	ibmcloud cf restage lantern-nexus-web

deploy:
	ibmcloud login
	ibmcloud target --cf-api https://api.ng.bluemix.net -o west@paperequator.com -s dev
	ibmcloud cf push
