#!/bin/sh -

DIRECTUS_DIR="/directus"
DIRECTUS_EXTENSIONS="${DIRECTUS_DIR}/extensions"
DIRECTUS_INTERFACES="${DIRECTUS_EXTENSIONS}/interfaces"
DIRECTUS_MODULES="${DIRECTUS_EXTENSIONS}/modules"
DIRECTUS_DISPLAYS="${DIRECTUS_EXTENSIONS}/displays"
DIRECTUS_ENDPOINTS="${DIRECTUS_EXTENSIONS}/endpoints"
DIRECTUS_HOOKS="${DIRECTUS_EXTENSIONS}/hooks"

mkdir -p ${DIRECTUS_EXTENSIONS}/migrations

# Install crawless custom extensions
# Download from project: https://gitlab.com/crawless/directus-custom-extensions
rm -rf directus-custom-extensions-release*
curl --header "Private-Token: ${GITLAB_PIPELINE_TOKEN}" -LO ${CI_API_V4_URL}/projects/40500377/packages/generic/Releases/0.0.1/directus-custom-extensions-release.zip

unzip directus-custom-extensions-release.zip

cd directus-custom-extensions-release
ls -la

# Extensions to skip (these belong to different control scripts)
# These are payment, chat, leads and collaboration extensions
skip_extensions="payments-api payments-hook payments-module services-module orders-module chat chat-display dashboard leads areas saved-searches area-hook collab-hook collab-hook-v2 marketplace-filters workflows-defaults extended-api operator-whitelist"

# Corresponding migrations to skip
skip_migrations="update-collections-ttl-and-disposable add-chat add-saved-searches add-collaboration"

# Skip payment extension
if [ -z "$PAYMENT_EXTENSION" ]; then
	skip_extensions="payment recaptcha ${skip_extensions}"
fi

# Skip loading devices if not set
if [ -z "$DEVICES_EXTENSION" ]; then
	skip_extensions="devices ${skip_extensions}"
	skip_migrations="add-devices ${skip_migrations}"
fi

# Skip loading collection-builder extensions if not set
if [ -z "$COLLECTION_BUILDER_EXTENSION" ]; then
	skip_extensions="collection-builder ${skip_extensions}"
	skip_migrations="add-collection-builder ${skip_migrations}"
fi

echo $skip_migrations

tree

for folder in *
do
    # If the folder name starts with directus-extension, this is a bundle
    if echo "$folder" | grep -q "^directus-extension"; then
        echo "Adding bundle ${folder}"
        mv "./${folder}" "${DIRECTUS_EXTENSIONS}/"
        ls -la ${DIRECTUS_EXTENSIONS}/
        ls -la ${DIRECTUS_EXTENSIONS}/${folder}/
        continue
    fi

    ext_type="${folder}"
    # Skip all migrations here
    if [ "$ext_type" = "migrations" ]; then
        continue
    fi

    cd ${ext_type}
    for ext_name in *
    do
        # Skip extensions
        if echo "$skip_extensions" | grep -qw "$ext_name"; then
            echo "Skipping ${ext_type}/${ext_name}"
            continue
        fi
        echo "Adding ${ext_type}/${ext_name}"
        # Move all the files from the extension to the directory (recursive)
        if [ "${ext_type}" = "bundles" ]; then
            # Ensure that the destination directory exists
            echo "This is a bundle"
            mkdir -p ${DIRECTUS_EXTENSIONS}/directus-extension-${ext_name}
            mkdir -p ${DIRECTUS_EXTENSIONS}/directus-extension-${ext_name}/dist
            pwd
            ls -lsa
            ls -lsa ${DIRECTUS_EXTENSIONS}/directus-extension-${ext_name}
            tree
            mv "./${ext_name}"/* "${DIRECTUS_EXTENSIONS}/directus-extension-${ext_name}/dist/"
            mv "${DIRECTUS_EXTENSIONS}/directus-extension-${ext_name}/dist/package.json" "${DIRECTUS_EXTENSIONS}/directus-extension-${ext_name}/"

            # if [ -f "${DIRECTUS_EXTENSIONS}/${ext_name}/package.json" ]; then
            #     rm "${DIRECTUS_EXTENSIONS}/${ext_name}/package.json"
            # fi
        else
            # Ensure that the destination directory exists
            mkdir -p ${DIRECTUS_EXTENSIONS}/${ext_type}/${ext_name}
            mv "./${ext_name}"/* "${DIRECTUS_EXTENSIONS}/${ext_type}/${ext_name}/"
        fi
        # mv "./${ext_name}"/* "${DIRECTUS_EXTENSIONS}/${ext_type}/${ext_name}/"
        # Sanity check: list the files in the resulting directory
        echo "Contents of extensions/${ext_type}/${ext_name}:"
        ls -la ${DIRECTUS_EXTENSIONS}/${ext_type}/${ext_name}/
        # Sanity check: see that index.js has not been created in the ext_type folder instead of ext_name
        if [ -f "${DIRECTUS_EXTENSIONS}/${ext_type}/index.js" ]; then
            echo "[?!] index.js found in ${DIRECTUS_EXTENSIONS}/${ext_type}"
        fi

    done
    cd ..

done

rm -rf directus/directus-custom-extensions-release/bundles/

tree

if [ ! -d "migrations" ]; then
    echo "No migrations found"
    exit 0
fi
cd migrations
for migration in *
do
    # Skip migrations
    migration_name=$(basename "$migration" .js | cut -c 16-)
    if echo "$skip_migrations" | grep -qw "$migration_name"; then
    	  echo "Skip migration ${migration}"
        continue
    fi
    echo "Adding migration ${migration}"
    cp ${migration} ${DIRECTUS_EXTENSIONS}/migrations/
done

cd ..
