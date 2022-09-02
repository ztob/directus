#!/bin/sh -

DIRECTUS_DIR="/directus/api"
#DIRECTUS_DIR="/tmp"

# Install https://github.com/utomic-media/directus-extension-field-actions

mkdir -p ${DIRECTUS_DIR}/displays/fields-action
wget -O ${DIRECTUS_DIR}/displays/fields-action/index.js https://github.com/utomic-media/directus-extension-field-actions/releases/download/1.1.1/display-index.js
mkdir -p ${DIRECTUS_DIR}/interfaces/fields-action
wget -O ${DIRECTUS_DIR}/interfaces/fields-action/index.js https://github.com/utomic-media/directus-extension-field-actions/releases/download/1.1.1/interface-index.js

# Install https://github.com/u12206050/directus-extension-global-search

mkdir -p ${DIRECTUS_DIR}/extensions/modules
wget -O /tmp/global-search.zip https://github.com/u12206050/directus-extension-global-search/releases/download/1.0.0/global-search.zip
unzip -d ${DIRECTUS_DIR}/extensions/modules/ /tmp/global-search.zip
