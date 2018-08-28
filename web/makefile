MAKEFLAGS += --warn-undefined-variables
SHELL := /bin/bash

.PHONY: run

run:
	npm start

deploy:
	ibmcloud login
	ibmcloud cf push
