MAKEFLAGS += --warn-undefined-variables
SHELL := /bin/bash

APP_ID := lantern-nexus-web
.PHONY: run

run:
	npm start

deploy:
	ibmcloud login
	ibmcloud target --cf-api https://api.ng.bluemix.net -o west@paperequator.com -s dev
	ibmcloud cf push