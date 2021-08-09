# Changelog

_Changes marked with a :warning: contain potential breaking changes depending on your use of the package._

## v9.0.0-rc.88 (August 2, 2021)

### :sparkles: New Features

- **App**
  - [#7130](https://github.com/directus/directus/pull/7130) Add accordion group
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#7101](https://github.com/directus/directus/pull/7101) Surface dropdown choices in advanced sidebar filter
    ([@rijkvanzanten](https://github.com/rijkvanzanten))

### :rocket: Improvements

- **App**
  - [#7141](https://github.com/directus/directus/pull/7141) Title format repeater names
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#7132](https://github.com/directus/directus/pull/7132) Add missing keys to translations
    ([@nickrum](https://github.com/nickrum))
  - [#7103](https://github.com/directus/directus/pull/7103) Add a standardized max-height to tree select interface
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#7102](https://github.com/directus/directus/pull/7102) Render list group arrows on the left of the group checkbox
    in the tree select interface ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#7059](https://github.com/directus/directus/pull/7059) Added "Default Open" Checkbox to Field Group Dividers
    ([@m0rtis0](https://github.com/m0rtis0))
- **API**
  - [#7105](https://github.com/directus/directus/pull/7105) Stall login/pw reset to prevent email leaking
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6580](https://github.com/directus/directus/pull/6580) Warn on Missing Migrations
    ([@jaycammarano](https://github.com/jaycammarano))

### :bug: Bug Fixes

- **App**
  - [#7142](https://github.com/directus/directus/pull/7142) Prevent duplicate alias fields from being created
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#7135](https://github.com/directus/directus/pull/7135) Fix nested fields check in validate-payload handler
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#7131](https://github.com/directus/directus/pull/7131) Fix default value of select-icon interface
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
- **API**
  - [#7139](https://github.com/directus/directus/pull/7139) Fix cache-key generation for query params
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#7104](https://github.com/directus/directus/pull/7104) Fix users accountability tracking
    ([@rijkvanzanten](https://github.com/rijkvanzanten))

### :memo: Documentation

- [#7106](https://github.com/directus/directus/pull/7106) Add note on conditional fields
  ([@rijkvanzanten](https://github.com/rijkvanzanten))
- [#7099](https://github.com/directus/directus/pull/7099) Add note regarding required directus:extension field to
  extension docs ([@nickrum](https://github.com/nickrum))
- [#7079](https://github.com/directus/directus/pull/7079) Add note on npm run dev restart
  ([@rijkvanzanten](https://github.com/rijkvanzanten))
- [#7077](https://github.com/directus/directus/pull/7077) Add note on hook params
  ([@rijkvanzanten](https://github.com/rijkvanzanten))

### :package: Dependency Updates

- [#7136](https://github.com/directus/directus/pull/7136) update typescript-eslint monorepo to v4.29.0
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#7117](https://github.com/directus/directus/pull/7117) update dependency joi to v17.4.2
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#7115](https://github.com/directus/directus/pull/7115) update dependency knex to v0.95.9
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#7110](https://github.com/directus/directus/pull/7110) update dependency sass to v1.37.0
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#7109](https://github.com/directus/directus/pull/7109) update dependency eslint to v7.32.0
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#7094](https://github.com/directus/directus/pull/7094) update dependency @rollup/plugin-commonjs to v20
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#7093](https://github.com/directus/directus/pull/7093) update dependency chalk to v4.1.2
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#7090](https://github.com/directus/directus/pull/7090) update dependency npm-watch to v0.11.0
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#7089](https://github.com/directus/directus/pull/7089) update dependency eslint-plugin-vue to v7.15.0
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#7087](https://github.com/directus/directus/pull/7087) update styfle/cancel-workflow-action action to v0.9.1
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#7085](https://github.com/directus/directus/pull/7085) update dependency rollup to v2.55.1
  ([@renovate[bot]](https://github.com/apps/renovate))

## v9.0.0-rc.87 (July 28, 2021)

### :sparkles: New Features

- **API**
  - [#7014](https://github.com/directus/directus/pull/7014) Add new /utils/cache/clear endpoint
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#7008](https://github.com/directus/directus/pull/7008) Prevent from deleting the last admin user
    ([@rijkvanzanten](https://github.com/rijkvanzanten))

### :rocket: Improvements

- **App**
  - [#7025](https://github.com/directus/directus/pull/7025) Handle autocomplete empty path configurations
    ([@luanmm](https://github.com/luanmm))
  - [#7013](https://github.com/directus/directus/pull/7013) Use limit layoutQuery in export sidebar detail
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
- **API**
  - [#7003](https://github.com/directus/directus/pull/7003) Default SERVE_APP to true
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6987](https://github.com/directus/directus/pull/6987) Wait for the database to be ready in bootstrap step
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6852](https://github.com/directus/directus/pull/6852) Support for notifying user if an update is available for
    Directus CLI ([@msaaddev](https://github.com/msaaddev))

### :bug: Bug Fixes

- **API**
  - [#7060](https://github.com/directus/directus/pull/7060) Fix top level perm check on nested m2a records
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#7050](https://github.com/directus/directus/pull/7050) Don't throw 500 on missing email
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#7042](https://github.com/directus/directus/pull/7042) Fix type checking in password reset controller
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#7041](https://github.com/directus/directus/pull/7041) Fix mssql max-length doubling
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#7027](https://github.com/directus/directus/pull/7027) Move object-hash to non-optional deps
    ([@paescuj](https://github.com/paescuj))
  - [#7021](https://github.com/directus/directus/pull/7021) Fix cache-key causing problems in memcached
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#7020](https://github.com/directus/directus/pull/7020) Don't return collections outside of cache
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#7019](https://github.com/directus/directus/pull/7019) Fix MS SQL unique constraint field name extraction
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#7008](https://github.com/directus/directus/pull/7008) Prevent from deleting the last admin user
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#7003](https://github.com/directus/directus/pull/7003) Default SERVE_APP to true
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
- **App**
  - [#7057](https://github.com/directus/directus/pull/7057) Fix last action button not surfacing on mobile
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#7049](https://github.com/directus/directus/pull/7049) Fix value unstaging in nested field groups
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#7045](https://github.com/directus/directus/pull/7045) Remove illegal words from translations root
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#7018](https://github.com/directus/directus/pull/7018) Add selectMode to Calendar layout
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#7012](https://github.com/directus/directus/pull/7012) Fix M2O type in O2M creation when referencing UUID-PK
    collections ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#7005](https://github.com/directus/directus/pull/7005) Fix advanced filter sidebar detail
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6924](https://github.com/directus/directus/pull/6924) Add modular extension badge to app docs
    ([@Nitwel](https://github.com/Nitwel))
  - [#6775](https://github.com/directus/directus/pull/6775) Calendar range render
    ([@bernatvadell](https://github.com/bernatvadell))

### :package: Dependency Updates

- [#7056](https://github.com/directus/directus/pull/7056) update fullcalendar monorepo to v5.9.0
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#7028](https://github.com/directus/directus/pull/7028) update dependency rollup to v2.55.0
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#7023](https://github.com/directus/directus/pull/7023) update dependency pg to v8.7.1
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#7022](https://github.com/directus/directus/pull/7022) update dependency @types/dockerode to v3.2.7
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#7017](https://github.com/directus/directus/pull/7017) update dependency @types/sharp to v0.28.5
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#7007](https://github.com/directus/directus/pull/7007) update dependency pg to v8.7.0
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6998](https://github.com/directus/directus/pull/6998) update dependency @vitejs/plugin-vue to v1.3.0
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6997](https://github.com/directus/directus/pull/6997) update dependency vite to v2.4.4
  ([@renovate[bot]](https://github.com/apps/renovate))

## v9.0.0-rc.86 (July 26, 2021)

### :sparkles: New Features

- **API**
  - [#6890](https://github.com/directus/directus/pull/6890) Allow using a custom name for the refresh token cookie
    ([@j3n57h0m45](https://github.com/j3n57h0m45))
  - [#6593](https://github.com/directus/directus/pull/6593) Allow custom transformations of assets
    ([@tim-smart](https://github.com/tim-smart))
- **App**
  - [#6864](https://github.com/directus/directus/pull/6864) Add support for Conditional Fields
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#3209](https://github.com/directus/directus/pull/3209) Add default-folder option
    ([@dimitrov-adrian](https://github.com/dimitrov-adrian))

### :rocket: Improvements

- **API**
  - [#6984](https://github.com/directus/directus/pull/6984) Fix pino deprecation warning
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6977](https://github.com/directus/directus/pull/6977) Improve error reporting on CLI bootstrap command
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6860](https://github.com/directus/directus/pull/6860) Use `/` as default value for public_url
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6845](https://github.com/directus/directus/pull/6845) Make extension loading more robust
    ([@nickrum](https://github.com/nickrum))
  - [#6843](https://github.com/directus/directus/pull/6843) Improve default value extraction in MS SQL
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6840](https://github.com/directus/directus/pull/6840) Show warning when PUBLIC_URL isn't correctly configured
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
- **Extensions**
  - [#6845](https://github.com/directus/directus/pull/6845) Make extension loading more robust
    ([@nickrum](https://github.com/nickrum))
- **App**
  - [#6838](https://github.com/directus/directus/pull/6838) Auto-open groups on search in tree-select
    ([@rijkvanzanten](https://github.com/rijkvanzanten))

### :bug: Bug Fixes

- **API**
  - [#6968](https://github.com/directus/directus/pull/6968) Fix quotes with schema default values
    ([@aidenfoxx](https://github.com/aidenfoxx))
  - [#6862](https://github.com/directus/directus/pull/6862) Fix extension loading on Windows
    ([@nickrum](https://github.com/nickrum))
  - [#6847](https://github.com/directus/directus/pull/6847) Make sure every DB returns time as HH:mm:ss
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6841](https://github.com/directus/directus/pull/6841) Fixed issue that would cause the wrong field to be extracted
    when using "detailed" updates in o2m with non-"id" primary keys ([@rijkvanzanten](https://github.com/rijkvanzanten))
- **App**
  - [#6943](https://github.com/directus/directus/pull/6943) Fix form field sort order
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6856](https://github.com/directus/directus/pull/6856) Fix logs logo alignment
    ([@SeanDylanGoff](https://github.com/SeanDylanGoff))
- **sdk**
  - [#6925](https://github.com/directus/directus/pull/6925) Fix SDK invite accept
    ([@MajesteitBart](https://github.com/MajesteitBart))
- **Misc.**
  - [#6878](https://github.com/directus/directus/pull/6878) Fix update/delete relation docs
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
- **Extensions**
  - [#6862](https://github.com/directus/directus/pull/6862) Fix extension loading on Windows
    ([@nickrum](https://github.com/nickrum))

### :memo: Documentation

- [#6962](https://github.com/directus/directus/pull/6962) Add PUBLIC_URL example in docker-compose guide
  ([@paescuj](https://github.com/paescuj))
- [#6920](https://github.com/directus/directus/pull/6920) Use `--workspace` instead of `cd` in "Running locally" guide
  ([@paescuj](https://github.com/paescuj))
- [#6878](https://github.com/directus/directus/pull/6878) Fix update/delete relation docs
  ([@rijkvanzanten](https://github.com/rijkvanzanten))
- [#6846](https://github.com/directus/directus/pull/6846) Correctly document the default value of PUBLIC_URL
  ([@nickrum](https://github.com/nickrum))
- [#6830](https://github.com/directus/directus/pull/6830) Fix session memcache variable name
  ([@Moeriki](https://github.com/Moeriki))

### :package: Dependency Updates

- [#6985](https://github.com/directus/directus/pull/6985) pin dependency lodash to 4.17.21
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6983](https://github.com/directus/directus/pull/6983) pin dependency joi to 17.4.1
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6980](https://github.com/directus/directus/pull/6980) update dependency @rollup/plugin-yaml to v3.1.0
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6979](https://github.com/directus/directus/pull/6979) update typescript-eslint monorepo to v4.28.5
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6976](https://github.com/directus/directus/pull/6976) update dependency knex-schema-inspector to v1.5.12
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6975](https://github.com/directus/directus/pull/6975) Update knex-schema-inspector@1.5.12
  ([@rijkvanzanten](https://github.com/rijkvanzanten))
- [#6973](https://github.com/directus/directus/pull/6973) update dependency @rollup/plugin-commonjs to v19.0.2
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6958](https://github.com/directus/directus/pull/6958) update dependency knex to v0.95.8
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6954](https://github.com/directus/directus/pull/6954) update dependency rollup to v2.54.0
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6951](https://github.com/directus/directus/pull/6951) update dependency @rollup/plugin-node-resolve to v13.0.4
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6949](https://github.com/directus/directus/pull/6949) update dependency lint-staged to v11.1.1
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6944](https://github.com/directus/directus/pull/6944) update dependency sass to v1.36.0
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6934](https://github.com/directus/directus/pull/6934) update dependency date-fns to v2
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6933](https://github.com/directus/directus/pull/6933) update dependency tedious to v11.4.0
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6928](https://github.com/directus/directus/pull/6928) update dependency lint-staged to v11.1.0
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6914](https://github.com/directus/directus/pull/6914) pin dependency @types/object-hash to 2.1.1
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6913](https://github.com/directus/directus/pull/6913) update dependency ts-jest to v27.0.4
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6911](https://github.com/directus/directus/pull/6911) update dependency codemirror to v5.62.2
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6903](https://github.com/directus/directus/pull/6903) update dependency rollup to v2.53.3
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6901](https://github.com/directus/directus/pull/6901) update dependency supertest to v6.1.4
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6896](https://github.com/directus/directus/pull/6896) update dependency codemirror to v5.62.1
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6894](https://github.com/directus/directus/pull/6894) update dependency gatsby-source-filesystem to v3.10.0
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6891](https://github.com/directus/directus/pull/6891) update dependency vite to v2.4.3
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6882](https://github.com/directus/directus/pull/6882) update typescript-eslint monorepo to v4.28.4
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6874](https://github.com/directus/directus/pull/6874) update dependency @types/dockerode to v3.2.6
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6873](https://github.com/directus/directus/pull/6873) update dependency stylelint-scss to v3.20.1
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6869](https://github.com/directus/directus/pull/6869) update dependency eslint-plugin-vue to v7.14.0
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6868](https://github.com/directus/directus/pull/6868) update dependency eslint to v7.31.0
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6863](https://github.com/directus/directus/pull/6863) update vue monorepo to v3.1.5
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6855](https://github.com/directus/directus/pull/6855) update dependency @types/dockerode to v3.2.5
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6849](https://github.com/directus/directus/pull/6849) update dependency @rollup/plugin-node-resolve to v13.0.2
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6839](https://github.com/directus/directus/pull/6839) update dependency slugify to v1.6.0
  ([@renovate[bot]](https://github.com/apps/renovate))

Directus refs/tags/v9.0.0-rc.86

## v9.0.0-rc.85 (July 15, 2021)

### :bug: Bug Fixes

- **shared**
  - [#6836](https://github.com/directus/directus/pull/6836) Fix production build on node versions <16
    ([@nickrum](https://github.com/nickrum))

## v9.0.0-rc.84 (July 15, 2021)

### :sparkles: New Features

- **sdk**
  - [#6824](https://github.com/directus/directus/pull/6824) add updateByQuery to js sdk
    ([@wc-matteo](https://github.com/wc-matteo))
  - [#6742](https://github.com/directus/directus/pull/6742) Support invite_url in SDK invite method
    ([@paescuj](https://github.com/paescuj))
- **App**
  - [#6799](https://github.com/directus/directus/pull/6799) Support Slovenian language
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
- **Docker**
  - [#6796](https://github.com/directus/directus/pull/6796) Add support for Docker ARM image
    ([@paescuj](https://github.com/paescuj))
- **Extensions**
  - [#6735](https://github.com/directus/directus/pull/6735) Allow extension-sdk to bundle API extensions as well
    ([@nickrum](https://github.com/nickrum))

### :rocket: Improvements

- **App**
  - [#6835](https://github.com/directus/directus/pull/6835) Add v-md directive
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6640](https://github.com/directus/directus/pull/6640) Support arrays in formatted-json-value display
    ([@Kematia](https://github.com/Kematia))
- **Extensions**
  - [#6835](https://github.com/directus/directus/pull/6835) Add v-md directive
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6706](https://github.com/directus/directus/pull/6706) Configure build command based on extension manifest
    ([@nickrum](https://github.com/nickrum))
- **API**
  - [#6804](https://github.com/directus/directus/pull/6804) Allow setting a custom mailgun host
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6746](https://github.com/directus/directus/pull/6746) Add encrypt option to MS SQL questions
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6734](https://github.com/directus/directus/pull/6734) No error message from password reset request #6658
    ([@dannycoulombe](https://github.com/dannycoulombe))
- **create-directus-project**
  - [#6791](https://github.com/directus/directus/pull/6791) Catch and show errors in execa calls
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
- **Docker**
  - [#6659](https://github.com/directus/directus/pull/6659) Install exact version of Directus
    ([@paescuj](https://github.com/paescuj))

### :bug: Bug Fixes

- **Misc.**
  - [#6813](https://github.com/directus/directus/pull/6813) Add required deps for Docker ARM build
    ([@paescuj](https://github.com/paescuj))
  - [#6805](https://github.com/directus/directus/pull/6805) disable lerna access verification
    ([@SeanDylanGoff](https://github.com/SeanDylanGoff))
- **App**
  - [#6810](https://github.com/directus/directus/pull/6810) Fix sidebar overflow in preset detail
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6809](https://github.com/directus/directus/pull/6809) Fix relationship setup not showing current collection
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6807](https://github.com/directus/directus/pull/6807) Clear group when duplicating field
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6806](https://github.com/directus/directus/pull/6806) Fix system locked fields showing double
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6801](https://github.com/directus/directus/pull/6801) Fix permissions/validation default value for full
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6800](https://github.com/directus/directus/pull/6800) Fetch all languages in the translations interface
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6733](https://github.com/directus/directus/pull/6733) Fix md editor being empty when editing existing value
    ([@nickrum](https://github.com/nickrum))
  - [#6732](https://github.com/directus/directus/pull/6732) Fix two small issues around field grouping
    ([@nickrum](https://github.com/nickrum))
- **API**
  - [#6808](https://github.com/directus/directus/pull/6808) Use [String] for CSV type in GraphQL
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6783](https://github.com/directus/directus/pull/6783) Fixed issue that would prevent reordering in M2A
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6740](https://github.com/directus/directus/pull/6740) Fix "Duplicate environment variable" error message never
    showing up ([@paescuj](https://github.com/paescuj))
  - [#6722](https://github.com/directus/directus/pull/6722) Fixed migration changing filesize failing on Oracle
    ([@aidenfoxx](https://github.com/aidenfoxx))
  - [#6645](https://github.com/directus/directus/pull/6645) Fix item.read hook not firing for readByQuery
    ([@MoltenCoffee](https://github.com/MoltenCoffee))
- **Extensions**
  - [#6700](https://github.com/directus/directus/pull/6700) Fix requiring vue from a cjs/umd dependency in a extension
    ([@nickrum](https://github.com/nickrum))

### :memo: Documentation

- [#6785](https://github.com/directus/directus/pull/6785) Clarify definition of environment variables
  ([@paescuj](https://github.com/paescuj))
- [#6784](https://github.com/directus/directus/pull/6784) Add note about sensitive values in Docker guide
  ([@paescuj](https://github.com/paescuj))

### :package: Dependency Updates

- [#6828](https://github.com/directus/directus/pull/6828) update dependency @rollup/plugin-node-resolve to v13.0.1
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6826](https://github.com/directus/directus/pull/6826) update dependency @rollup/plugin-commonjs to v19.0.1
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6812](https://github.com/directus/directus/pull/6812) update dependency rollup to v2.53.2
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6788](https://github.com/directus/directus/pull/6788) update dependency tedious to v11.2.0
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6780](https://github.com/directus/directus/pull/6780) update dependency vue-i18n to v9.1.7
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6777](https://github.com/directus/directus/pull/6777) update dependency lint-staged to v11.0.1
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6769](https://github.com/directus/directus/pull/6769) update typescript-eslint monorepo to v4.28.3
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6768](https://github.com/directus/directus/pull/6768) update dependency vite to v2.4.2
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6767](https://github.com/directus/directus/pull/6767) update dependency @vitejs/plugin-vue to v1.2.5
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6748](https://github.com/directus/directus/pull/6748) update dependency pinia to v2.0.0-beta.5
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6747](https://github.com/directus/directus/pull/6747) update dependency knex to v0.95.7
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6745](https://github.com/directus/directus/pull/6745) update dependency @tinymce/tinymce-vue to v4.0.4
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6744](https://github.com/directus/directus/pull/6744) update dependency ts-node to v10.1.0
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6727](https://github.com/directus/directus/pull/6727) update dependency @types/cors to v2.8.12
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6726](https://github.com/directus/directus/pull/6726) update dependency @types/figlet to v1.5.4
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6724](https://github.com/directus/directus/pull/6724) update dependency @types/marked-terminal to v3.1.2
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6717](https://github.com/directus/directus/pull/6717) update dependency sass to v1.35.2
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6716](https://github.com/directus/directus/pull/6716) update dependency @types/qs to v6.9.7
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6715](https://github.com/directus/directus/pull/6715) update dependency @types/qrcode to v1.4.1
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6712](https://github.com/directus/directus/pull/6712) update dependency @types/nodemailer to v6.4.4
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6711](https://github.com/directus/directus/pull/6711) update dependency gatsby-source-filesystem to v3.9.0
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6710](https://github.com/directus/directus/pull/6710) update dependency rollup to v2.53.1
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6708](https://github.com/directus/directus/pull/6708) update dependency @types/node-cron to v2.0.4
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6707](https://github.com/directus/directus/pull/6707) update dependency @types/marked to v2.0.4
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6705](https://github.com/directus/directus/pull/6705) update dependency @types/markdown-it to v12.0.3
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6704](https://github.com/directus/directus/pull/6704) update dependency @types/lodash to v4.14.171
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6702](https://github.com/directus/directus/pull/6702) update dependency @types/listr to v0.14.4
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6701](https://github.com/directus/directus/pull/6701) update dependency @types/keyv to v3.1.2
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6697](https://github.com/directus/directus/pull/6697) update dependency @types/jsonwebtoken to v8.5.4
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6696](https://github.com/directus/directus/pull/6696) update dependency @types/json2csv to v5.0.3
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6694](https://github.com/directus/directus/pull/6694) update dependency @types/js-yaml to v4.0.2
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6692](https://github.com/directus/directus/pull/6692) update dependency @types/jest to v26.0.24
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6690](https://github.com/directus/directus/pull/6690) update dependency @types/inquirer to v7.3.3
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6689](https://github.com/directus/directus/pull/6689) update dependency @types/fs-extra to v9.0.12
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6688](https://github.com/directus/directus/pull/6688) update dependency @types/figlet to v1.5.2
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6687](https://github.com/directus/directus/pull/6687) update dependency @types/express-session to v1.17.4
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6686](https://github.com/directus/directus/pull/6686) update dependency @types/express to v4.17.13
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6685](https://github.com/directus/directus/pull/6685) update dependency @types/dockerode to v3.2.4
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6683](https://github.com/directus/directus/pull/6683) update dependency @types/diff to v5.0.1
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6682](https://github.com/directus/directus/pull/6682) update dependency @types/cors to v2.8.11
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6681](https://github.com/directus/directus/pull/6681) update dependency @types/color to v3.0.2
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6680](https://github.com/directus/directus/pull/6680) update dependency @types/codemirror to v5.60.2
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6679](https://github.com/directus/directus/pull/6679) update dependency @types/bytes to v3.1.1
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6678](https://github.com/directus/directus/pull/6678) update dependency @types/busboy to v0.2.4
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6677](https://github.com/directus/directus/pull/6677) update dependency @types/body-parser to v1.19.1
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6676](https://github.com/directus/directus/pull/6676) update dependency @types/async to v3.2.7
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6675](https://github.com/directus/directus/pull/6675) update dependency @types/sharp to v0.28.4
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6669](https://github.com/directus/directus/pull/6669) update dependency vite to v2.4.1
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6668](https://github.com/directus/directus/pull/6668) update dependency eslint-plugin-vue to v7.13.0
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6667](https://github.com/directus/directus/pull/6667) update dependency dompurify to v2.3.0
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6660](https://github.com/directus/directus/pull/6660) update typescript-eslint monorepo to v4.28.2
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6657](https://github.com/directus/directus/pull/6657) update dependency vite to v2.4.0
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6652](https://github.com/directus/directus/pull/6652) update dependency nock to v13.1.1
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6634](https://github.com/directus/directus/pull/6634) update dependency @types/stream-json to v1.7.1
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6630](https://github.com/directus/directus/pull/6630) update dependency eslint to v7.30.0
  ([@renovate[bot]](https://github.com/apps/renovate))

## v9.0.0-rc.83 (July 14, 2021)

### :bug: Bug Fixes

- **App**
  - [#6566](https://github.com/directus/directus/pull/6566) Fix half-width fields before groups causing trouble
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
- **API**
  - [#6561](https://github.com/directus/directus/pull/6561) Add limit options for deleteMany files
    ([@Enhed](https://github.com/Enhed))
  - [#6558](https://github.com/directus/directus/pull/6558) Fixed typo in MySQL dialect
    ([@Oreilles](https://github.com/Oreilles))

### :package: Dependency Updates

- [#6564](https://github.com/directus/directus/pull/6564) update dependency ts-node-dev to v1.1.7
  ([@renovate[bot]](https://github.com/apps/renovate))

## v9.0.0-rc.82 (June 28, 2021)

### :sparkles: New Features

- **App**
  - [#6553](https://github.com/directus/directus/pull/6553) Add support for field grouping
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
- **Extensions**
  - [#6548](https://github.com/directus/directus/pull/6548) Add directus-extension CLI to extension-sdk
    ([@nickrum](https://github.com/nickrum))
- **sdk**
  - [#6538](https://github.com/directus/directus/pull/6538) Adds request and response interceptors on Axios transport
    ([@WoLfulus](https://github.com/WoLfulus))

### :rocket: Improvements

- **API**
  - [#6541](https://github.com/directus/directus/pull/6541) Pass on errors thrown in MailService
    ([@luanmm](https://github.com/luanmm))
- **App**
  - [#6215](https://github.com/directus/directus/pull/6215) Added escaping on file paths including "\u"
    ([@skizer](https://github.com/skizer))

### :bug: Bug Fixes

- **App**
  - [#6555](https://github.com/directus/directus/pull/6555) Fix auto-fill of directus_files in relational setup
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6530](https://github.com/directus/directus/pull/6530) Fix translations interface options crashing the App
    ([@nickrum](https://github.com/nickrum))
- **API**
  - [#6534](https://github.com/directus/directus/pull/6534) Fix extension loading when PUBLIC_URL is absolute without
    origin ([@nickrum](https://github.com/nickrum))
  - [#6516](https://github.com/directus/directus/pull/6516) Changed filesize to bigint for large files
    ([@Enhed](https://github.com/Enhed))
- **Extensions**
  - [#6534](https://github.com/directus/directus/pull/6534) Fix extension loading when PUBLIC_URL is absolute without
    origin ([@nickrum](https://github.com/nickrum))

### :package: Dependency Updates

- [#6547](https://github.com/directus/directus/pull/6547) update typescript-eslint monorepo to v4.28.1
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6546](https://github.com/directus/directus/pull/6546) update dependency jest to v27.0.6
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6520](https://github.com/directus/directus/pull/6520) update dependency @vitejs/plugin-vue to v1.2.4
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6518](https://github.com/directus/directus/pull/6518) update dependency simple-git-hooks to v2.5.1
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6498](https://github.com/directus/directus/pull/6498) update dependency commander to v8
  ([@renovate[bot]](https://github.com/apps/renovate))

## v9.0.0-rc.81 (June 26, 2021)

### :rocket: Improvements

- **App**
  - [#6466](https://github.com/directus/directus/pull/6466) Set calendar layout locale based on app locale
    ([@nickrum](https://github.com/nickrum))

### :bug: Bug Fixes

- **App**
  - [#6481](https://github.com/directus/directus/pull/6481) Fix login page not showing user's name on app required
    permissions role ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6377](https://github.com/directus/directus/pull/6377) Fix app extensions loading and registration
    ([@nickrum](https://github.com/nickrum))

### :memo: Documentation

- [#6467](https://github.com/directus/directus/pull/6467) Import a File link in Assets tip broken
  ([@Mrmiffo](https://github.com/Mrmiffo))

### :package: Dependency Updates

- [#6509](https://github.com/directus/directus/pull/6509) update dependency prettier to v2.3.2
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6507](https://github.com/directus/directus/pull/6507) update dependency marked to v2.1.3
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6499](https://github.com/directus/directus/pull/6499) update dependency rollup to v2.52.3
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6497](https://github.com/directus/directus/pull/6497) update dependency eslint-plugin-vue to v7.12.1
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6482](https://github.com/directus/directus/pull/6482) Update vue to 3.1.2
  ([@rijkvanzanten](https://github.com/rijkvanzanten))
- [#6473](https://github.com/directus/directus/pull/6473) update dependency mitt to v3
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6470](https://github.com/directus/directus/pull/6470) update dependency fs-extra to v10
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6469](https://github.com/directus/directus/pull/6469) pin dependencies
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6468](https://github.com/directus/directus/pull/6468) update dependency @types/codemirror to v5.60.1
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6459](https://github.com/directus/directus/pull/6459) update dependency tinymce to v5.8.2
  ([@renovate[bot]](https://github.com/apps/renovate))

## v9.0.0-rc.80 (June 22, 2021)

### :sparkles: New Features

- **API**
  - :warning: [#6456](https://github.com/directus/directus/pull/6456) Add schema caching
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6437](https://github.com/directus/directus/pull/6437) Add support for starts/ends with filters
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
- **App**
  - [#6441](https://github.com/directus/directus/pull/6441) Add checkboxes-tree interface
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6430](https://github.com/directus/directus/pull/6430) Add Serbian (Latin) Language
    ([@srkinftel](https://github.com/srkinftel))

### :bug: Bug Fixes

- **App**
  - [#6455](https://github.com/directus/directus/pull/6455) Fixed issue that would prevent source code editing from
    staging values in wysiwyg ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6454](https://github.com/directus/directus/pull/6454) Fixed color option of the notice presentation interface
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6453](https://github.com/directus/directus/pull/6453) Fixed issue that would throw error in console when creating
    a new item in a collection w/ translations ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6451](https://github.com/directus/directus/pull/6451) Fix creating custom names for recommend collection fields on
    new collection setup drawer ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6450](https://github.com/directus/directus/pull/6450) Fixed rendering of SVGs in single file image interface
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6449](https://github.com/directus/directus/pull/6449) Fix header buttons not functioning in markdown interface
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6447](https://github.com/directus/directus/pull/6447) Don't default to `directus_files` in local store on existing
    relation ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6442](https://github.com/directus/directus/pull/6442) Fix display template on collection detail page
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6421](https://github.com/directus/directus/pull/6421) Update admin to use `no-store`
    ([@aidenfoxx](https://github.com/aidenfoxx))
  - [#6361](https://github.com/directus/directus/pull/6361) Fix spacings and icons on presentation link buttons
    ([@HitomiTenshi](https://github.com/HitomiTenshi))
- **API**
  - [#6444](https://github.com/directus/directus/pull/6444) Don't return default val for PK field in singleton
    ([@rijkvanzanten](https://github.com/rijkvanzanten))

### :package: Dependency Updates

- [#6445](https://github.com/directus/directus/pull/6445) fix(deps): update dependency gatsby-source-filesystem to
  v3.8.0 ([@renovate[bot]](https://github.com/apps/renovate))
- [#6443](https://github.com/directus/directus/pull/6443) update vue monorepo to v3.1.2
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6439](https://github.com/directus/directus/pull/6439) chore(deps): update dependency marked to v2.1.2
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6424](https://github.com/directus/directus/pull/6424) chore(deps): update dependency jest to v27.0.5
  ([@renovate[bot]](https://github.com/apps/renovate))

## v9.0.0-rc.79 (June 22, 2021)

Nothing to see here.. (Vue's update to 3.1.2 made things go 💥)

## v9.0.0-rc.78 (June 21, 2021)

### :rocket: Improvements

- **App**
  - [#6413](https://github.com/directus/directus/pull/6413) Use correct input type for type in advanced filter sidebar
    ([@rijkvanzanten](https://github.com/rijkvanzanten))

### :bug: Bug Fixes

- **App**
  - [#6412](https://github.com/directus/directus/pull/6412) Fixed issue that would prevent button/list-item links from
    functioning ([@rijkvanzanten](https://github.com/rijkvanzanten))

## v9.0.0-rc.77 (June 21, 2021)

### :sparkles: New Features

- **API**
  - [#6379](https://github.com/directus/directus/pull/6379) Add ability to specify what fields to clone on "Save as
    Copy" ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6341](https://github.com/directus/directus/pull/6341) Add support for `read` hooks on `items`
    ([@MoltenCoffee](https://github.com/MoltenCoffee))
  - [#6294](https://github.com/directus/directus/pull/6294) Allow overriding the s-maxage cache header
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
- **App**
  - [#6379](https://github.com/directus/directus/pull/6379) Add ability to specify what fields to clone on "Save as
    Copy" ([@rijkvanzanten](https://github.com/rijkvanzanten))

### :rocket: Improvements

- **API**
  - :warning: [#6355](https://github.com/directus/directus/pull/6355) Use `no-store` instead of `no-cache` for skipping
    the cache ([@nachogarcia](https://github.com/nachogarcia))
  - [#6349](https://github.com/directus/directus/pull/6349) Use existing file extension as default
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6347](https://github.com/directus/directus/pull/6347) Redact tokens from logs
    ([@rijkvanzanten](https://github.com/rijkvanzanten))

### :bug: Bug Fixes

- **API**
  - [#6350](https://github.com/directus/directus/pull/6350) Don't send sensitive data in webhooks
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6308](https://github.com/directus/directus/pull/6308) Fixed invalid onDelete constraint for OracleDB
    ([@aidenfoxx](https://github.com/aidenfoxx))
- **App**
  - [#6348](https://github.com/directus/directus/pull/6348) Fixed issue that would cause uploads to the root folder of
    the file library to fail ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6318](https://github.com/directus/directus/pull/6318) Fixed issue that would prevent setting the placeholder on
    the input interface ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6289](https://github.com/directus/directus/pull/6289) Fixed issue that would prevent the "Import from URL"
    functionality to work in a many to many interface ([@rijkvanzanten](https://github.com/rijkvanzanten))

### :memo: Documentation

- [#6360](https://github.com/directus/directus/pull/6360) Add "require('axios')" in API hooks examples
  ([@paescuj](https://github.com/paescuj))
- [#6339](https://github.com/directus/directus/pull/6339) Fix broken link in quickstart
  ([@geertijewski](https://github.com/geertijewski))
- [#6311](https://github.com/directus/directus/pull/6311) Update SDK doc with note on using multiple instances
  ([@martinemmert](https://github.com/martinemmert))
- [#6284](https://github.com/directus/directus/pull/6284) Add workaround for vite auto-replacement in docs
  ([@nickrum](https://github.com/nickrum))

### :package: Dependency Updates

- [#6406](https://github.com/directus/directus/pull/6406) chore(deps): update typescript-eslint monorepo to v4.28.0
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6405](https://github.com/directus/directus/pull/6405) chore(deps): update dependency vue-router to v4.0.10
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6401](https://github.com/directus/directus/pull/6401) chore(deps): update dependency codemirror to v5.62.0
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6400](https://github.com/directus/directus/pull/6400) chore(deps): update dependency rollup to v2.52.2
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6399](https://github.com/directus/directus/pull/6399) chore(deps): update dependency swagger-ui-watcher to v2.1.12
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6392](https://github.com/directus/directus/pull/6392) chore(deps): update dependency vite to v2.3.8
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6391](https://github.com/directus/directus/pull/6391) chore(deps): update dependency @types/inquirer to v7.3.2
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6380](https://github.com/directus/directus/pull/6380) chore(deps): update dependency eslint to v7.29.0
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6371](https://github.com/directus/directus/pull/6371) chore(deps): update dependency pinia to v2.0.0-beta.3
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6363](https://github.com/directus/directus/pull/6363) chore(deps): update dependency @types/jsonwebtoken to v8.5.2
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6357](https://github.com/directus/directus/pull/6357) chore(deps): update dependency typescript to v4.3.4
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6342](https://github.com/directus/directus/pull/6342) fix(deps): update dependency chalk to v4
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6338](https://github.com/directus/directus/pull/6338) chore(deps): update postgres docker tag to v13
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6337](https://github.com/directus/directus/pull/6337) chore(deps): update dependency rollup to v2.52.1
  ([@renovate[bot]](https://github.com/apps/renovate))
- :warning: [#6336](https://github.com/directus/directus/pull/6336) Use node.js v16 in Docker image
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6334](https://github.com/directus/directus/pull/6334) chore(deps): update dependency fs-extra to v10
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6333](https://github.com/directus/directus/pull/6333) chore(deps): update dependency dotenv to v10
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6332](https://github.com/directus/directus/pull/6332) chore(deps): update mariadb docker tag to v10.6
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6331](https://github.com/directus/directus/pull/6331) chore(deps): update fullcalendar monorepo to v5.8.0
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6330](https://github.com/directus/directus/pull/6330) chore(deps): update dependency marked to v2.1.1
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6329](https://github.com/directus/directus/pull/6329) chore(deps): update dependency typescript to v4.3.3
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6328](https://github.com/directus/directus/pull/6328) fix(deps): update dependency ms to v2.1.3
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6327](https://github.com/directus/directus/pull/6327) chore(deps): update dependency vue-router to v4.0.9
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6324](https://github.com/directus/directus/pull/6324) chore(deps): update dependency globby to v11.0.4
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6323](https://github.com/directus/directus/pull/6323) fix(deps): pin dependencies
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6322](https://github.com/directus/directus/pull/6322) Configure Renovate
  ([@renovate[bot]](https://github.com/apps/renovate))
- [#6305](https://github.com/directus/directus/pull/6305) Bump sass from 1.35.0 to 1.35.1
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6304](https://github.com/directus/directus/pull/6304) Bump inquirer from 8.1.0 to 8.1.1
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6300](https://github.com/directus/directus/pull/6300) Bump rollup from 2.51.2 to 2.52.0
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6275](https://github.com/directus/directus/pull/6275) Bump @typescript-eslint/eslint-plugin from 4.26.1 to 4.27.0
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6274](https://github.com/directus/directus/pull/6274) Bump @typescript-eslint/parser from 4.26.1 to 4.27.0
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6273](https://github.com/directus/directus/pull/6273) Bump sass from 1.34.1 to 1.35.0
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6272](https://github.com/directus/directus/pull/6272) Bump aws-sdk from 2.927.0 to 2.928.0
  ([@dependabot[bot]](https://github.com/apps/dependabot))

## v9.0.0-rc.76 (June 14, 2021)

### :sparkles: New Features

- **API**
  - [#6221](https://github.com/directus/directus/pull/6221) Add support for date distance adjustment in `$NOW` filter
    variable ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6216](https://github.com/directus/directus/pull/6216) Added support for nodemailer ignoreTLS option
    ([@nichols-green](https://github.com/nichols-green))

### :rocket: Improvements

- **API**
  - [#6211](https://github.com/directus/directus/pull/6211) Optimized oracle schema overview query
    ([@aidenfoxx](https://github.com/aidenfoxx))

### :bug: Bug Fixes

- **API**
  - [#6267](https://github.com/directus/directus/pull/6267) Fix issue that would cause emails to be displayed
    incorrectly in certain email clients ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6225](https://github.com/directus/directus/pull/6225) Fix Oracle env error
    ([@aidenfoxx](https://github.com/aidenfoxx))
  - [#6208](https://github.com/directus/directus/pull/6208) Moved special check above localTypeMap check.
    ([@Oreilles](https://github.com/Oreilles))
  - [#6190](https://github.com/directus/directus/pull/6190) Fix type casting of boolean env var
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
- **App**
  - [#6264](https://github.com/directus/directus/pull/6264) Fixed issue that could cause the HTML interface to emit a
    change on first load ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6263](https://github.com/directus/directus/pull/6263) Fixed issue that would prevent the m2o from working on
    foreign keys with no meta row ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6262](https://github.com/directus/directus/pull/6262) Fixes issue that would prevent the layout from refreshing on
    batch operations ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6258](https://github.com/directus/directus/pull/6258) Fix collection selection in system-collections interface
    ([@nickrum](https://github.com/nickrum))
  - [#6236](https://github.com/directus/directus/pull/6236) Fix missing styling for WYSIWYG
    ([@masterwendu](https://github.com/masterwendu))
  - [#6212](https://github.com/directus/directus/pull/6212) Fix proxying to the app from a subpath
    ([@nickrum](https://github.com/nickrum))
- **specs**
  - [#6179](https://github.com/directus/directus/pull/6179) Fix OpenAPI specs ([@paescuj](https://github.com/paescuj))

### :memo: Documentation

- [#6232](https://github.com/directus/directus/pull/6232) Update the app extension docs to work with Vue 3
  ([@nickrum](https://github.com/nickrum))
- [#6209](https://github.com/directus/directus/pull/6209) Add note on file env vars
  ([@rijkvanzanten](https://github.com/rijkvanzanten))

### :package: Dependency Updates

- [#6240](https://github.com/directus/directus/pull/6240) Bump cropperjs from 1.5.11 to 1.5.12
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6239](https://github.com/directus/directus/pull/6239) Bump npm-watch from 0.9.0 to 0.10.0
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6238](https://github.com/directus/directus/pull/6238) Bump eslint-plugin-vue from 7.11.0 to 7.11.1
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6237](https://github.com/directus/directus/pull/6237) Bump aws-sdk from 2.926.0 to 2.927.0
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6201](https://github.com/directus/directus/pull/6201) Bump rollup from 2.51.1 to 2.51.2
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6200](https://github.com/directus/directus/pull/6200) Bump eslint-plugin-vue from 7.10.0 to 7.11.0
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6199](https://github.com/directus/directus/pull/6199) Bump aws-sdk from 2.925.0 to 2.926.0
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6198](https://github.com/directus/directus/pull/6198) Bump gatsby-source-filesystem from 3.7.0 to 3.7.1
  ([@dependabot[bot]](https://github.com/apps/dependabot))

## v9.0.0-rc.75 (June 10, 2021)

### 🚨 App Extensions

This release includes the big switch from Vue 2 to Vue 3. If you have (complicated) app extensions, make sure to update
the build chain of your extension and make sure you're aware of
[the breaking changes you might have to account for](https://v3.vuejs.org/guide/migration/introduction.html#breaking-changes).
We'll be upgrading the documentation and providing new boilerplates for Vue 3 based extensions in the coming days.

### :sparkles: New Features

- **API**
  - [#6155](https://github.com/directus/directus/pull/6155) Allow any of grant's (nested) configuration parameters
    (oAuth) ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6140](https://github.com/directus/directus/pull/6140) Add item duplicate fields configuration option to
    directus_collections ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6101](https://github.com/directus/directus/pull/6101) Add support for \_FILE environment variables
    ([@paescuj](https://github.com/paescuj))
- **App**
  - :warning: [#5339](https://github.com/directus/directus/pull/5339) Port the app to Vue 3
    ([@nickrum](https://github.com/nickrum))

### :rocket: Improvements

- **API**
  - :warning: [#6187](https://github.com/directus/directus/pull/6187) Add additional check to Two-Factor Authentication
    (by @masterwendu) ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6119](https://github.com/directus/directus/pull/6119) Don't treat numbers larger than the JS max number size as
    number values in environment variables ([@skizer](https://github.com/skizer))
- **App**
  - :warning: [#6187](https://github.com/directus/directus/pull/6187) Add additional check to Two-Factor Authentication
    (by @masterwendu) ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6186](https://github.com/directus/directus/pull/6186) Add number formatting to formatted-values display
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6171](https://github.com/directus/directus/pull/6171) Use JSON editor for JSON field type default value
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6168](https://github.com/directus/directus/pull/6168) Show better message for improperly formatted emails on login
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6118](https://github.com/directus/directus/pull/6118) Support async preRegisterCheck for custom modules
    ([@t7tran](https://github.com/t7tran))

### :bug: Bug Fixes

- **App**
  - [#6174](https://github.com/directus/directus/pull/6174) Fix issue that would cause sort order of fields to be
    corrupted on field changes ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6173](https://github.com/directus/directus/pull/6173) Prevent translation rows from being edited before existing
    values are loaded ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6172](https://github.com/directus/directus/pull/6172) Fix translations hint not linking to collection
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6171](https://github.com/directus/directus/pull/6171) Use JSON editor for JSON field type default value
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
- **API**
  - [#6167](https://github.com/directus/directus/pull/6167) Cleanup one_allowed_collections field on collection delete
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6163](https://github.com/directus/directus/pull/6163) Fix field update for data types with length or boolean as
    default value ([@paescuj](https://github.com/paescuj))
  - [#6153](https://github.com/directus/directus/pull/6153) Fixed issue that would cause foreign key constraints to be
    missed in pascal cased table names in postgres ([@rijkvanzanten](https://github.com/rijkvanzanten))

### :memo: Documentation

- [#6188](https://github.com/directus/directus/pull/6188) Adding an example to cron hook
  ([@juancarlosjr97](https://github.com/juancarlosjr97))
- [#6150](https://github.com/directus/directus/pull/6150) Describe breaking change in filter syntax in v8 migration
  information ([@nachogarcia](https://github.com/nachogarcia))
- [#6135](https://github.com/directus/directus/pull/6135) List cron in Event Format Options
  ([@benhaynes](https://github.com/benhaynes))

### :package: Dependency Updates

- [#6177](https://github.com/directus/directus/pull/6177) Bump aws-sdk from 2.924.0 to 2.925.0
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6176](https://github.com/directus/directus/pull/6176) Bump @azure/storage-blob from 12.5.0 to 12.6.0
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6175](https://github.com/directus/directus/pull/6175) Bump jest-environment-jsdom from 26.6.2 to 27.0.3
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6147](https://github.com/directus/directus/pull/6147) Bump dotenv from 9.0.2 to 10.0.0
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6146](https://github.com/directus/directus/pull/6146) Bump jest-environment-jsdom from 26.6.2 to 27.0.3
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6145](https://github.com/directus/directus/pull/6145) Bump @types/codemirror from 0.0.109 to 5.60.0
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6144](https://github.com/directus/directus/pull/6144) Bump lint-staged from 10.5.4 to 11.0.0
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6126](https://github.com/directus/directus/pull/6126) Bump execa from 5.0.1 to 5.1.1
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6125](https://github.com/directus/directus/pull/6125) Bump slugify from 1.5.0 to 1.5.3
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6124](https://github.com/directus/directus/pull/6124) Bump prettier from 2.3.0 to 2.3.1
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6123](https://github.com/directus/directus/pull/6123) Bump connect-redis from 5.2.0 to 6.0.0
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6122](https://github.com/directus/directus/pull/6122) Bump @types/sharp from 0.28.1 to 0.28.3
  ([@dependabot[bot]](https://github.com/apps/dependabot))

## v9.0.0-rc.74 (June 7, 2021)

### :sparkles: New Features

- **API**
  - [#6116](https://github.com/directus/directus/pull/6116) Add support for CRON hooks (interval)
    ([@rijkvanzanten](https://github.com/rijkvanzanten))

### :rocket: Improvements

- **App**
  - [#6112](https://github.com/directus/directus/pull/6112) Make mfa output code selectable
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
- **Docker**
  - [#6081](https://github.com/directus/directus/pull/6081) Optimize Docker image performance and formatting
    ([@paescuj](https://github.com/paescuj))

### :memo: Documentation

- [#6110](https://github.com/directus/directus/pull/6110) Improve search ability of update instructions
  ([@benhaynes](https://github.com/benhaynes))
- [#6087](https://github.com/directus/directus/pull/6087) Fix typo ([@benhaynes](https://github.com/benhaynes))
- [#6086](https://github.com/directus/directus/pull/6086) Update introduction.md
  ([@benhaynes](https://github.com/benhaynes))

### :package: Dependency Updates

- [#6109](https://github.com/directus/directus/pull/6109) Bump vue-loader from 15.9.6 to 15.9.7
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6108](https://github.com/directus/directus/pull/6108) Bump @types/yargs from 16.0.1 to 17.0.0
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6107](https://github.com/directus/directus/pull/6107) Bump mime-types from 2.1.30 to 2.1.31
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6106](https://github.com/directus/directus/pull/6106) Bump graphql-compose from 8.1.0 to 9.0.1
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6105](https://github.com/directus/directus/pull/6105) Bump jest from 27.0.3 to 27.0.4
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6082](https://github.com/directus/directus/pull/6082) Bump @godaddy/terminus from 4.7.2 to 4.9.0
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6069](https://github.com/directus/directus/pull/6069) Bump @fullcalendar/list from 5.7.0 to 5.7.2
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6068](https://github.com/directus/directus/pull/6068) Bump aws-sdk from 2.911.0 to 2.921.0
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6066](https://github.com/directus/directus/pull/6066) Bump @types/node from 15.9.0 to 15.12.0
  ([@dependabot[bot]](https://github.com/apps/dependabot))

## v9.0.0-rc.73 (June 4, 2021)

### :bug: Bug Fixes

- **App**
  - [#6060](https://github.com/directus/directus/pull/6060) Fixed issue that would prevent the corresponding o2m field
    from being created on m2o relational setup ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6056](https://github.com/directus/directus/pull/6056) Fixed issue that would cause the whole row to be draggable
    in the list-type interfaces ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6053](https://github.com/directus/directus/pull/6053) Fixed issue that would prevent the display tab to show for
    o2m type fields in field-setup ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6052](https://github.com/directus/directus/pull/6052) Fixed issue in collection color reading for tables that
    weren't configured in directus yet ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6049](https://github.com/directus/directus/pull/6049) Fixed right click handler not extending beyond nav items
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
- **API**
  - [#6059](https://github.com/directus/directus/pull/6059) Fixed unique constraint violation error extraction for MySQL
    5.7 ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6058](https://github.com/directus/directus/pull/6058) Fixed issue that would prevent creation relations to an
    unsigned auto-incremented primary key in MariaDB ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6055](https://github.com/directus/directus/pull/6055) Fixed an issue that would cause "text" fields to show up as
    varchar with length -1 in MS SQL ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6054](https://github.com/directus/directus/pull/6054) Fixed issue that would prevent usage of limit -1 on deep
    limit ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6048](https://github.com/directus/directus/pull/6048) Fixed issue that could trigger update actions of children on
    manual sorting of a parent o2m instance ([@rijkvanzanten](https://github.com/rijkvanzanten))
- **schema**
  - [#6058](https://github.com/directus/directus/pull/6058) Fixed issue that would prevent creation relations to an
    unsigned auto-incremented primary key in MariaDB ([@rijkvanzanten](https://github.com/rijkvanzanten))

### :memo: Documentation

- [#6051](https://github.com/directus/directus/pull/6051) Update projects.md
  ([@rijkvanzanten](https://github.com/rijkvanzanten))

## v9.0.0-rc.72 (June 3, 2021)

### :sparkles: New Features

- **App**
  - [#5818](https://github.com/directus/directus/pull/5818) Add support for adding a collection accent color
    ([@Oreilles](https://github.com/Oreilles))

### :rocket: Improvements

- **API**
  - [#6040](https://github.com/directus/directus/pull/6040) Handle illegal/corrupt relational rows better during foreign
    key migration ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6035](https://github.com/directus/directus/pull/6035) Extract IPTC title and keywords
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
- **App**
  - [#6025](https://github.com/directus/directus/pull/6025) Improve `disabled` state on the file interface
    ([@nickluger](https://github.com/nickluger))
- **sdk-js**
  - [#6007](https://github.com/directus/directus/pull/6007) Pass onUploadProgress function through to the axios request
    ([@moekify](https://github.com/moekify))

### :bug: Bug Fixes

- **API**
  - [#6045](https://github.com/directus/directus/pull/6045) Fix external query during transaction in foreign key
    constraint creation ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6043](https://github.com/directus/directus/pull/6043) Prevent foreign key constraint names from exceeding 64
    characters ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6042](https://github.com/directus/directus/pull/6042) Fixed issue that would prevent relationship updates on
    foreign key constraints with a custom index name ([@rijkvanzanten](https://github.com/rijkvanzanten))
- **Docker**
  - [#6044](https://github.com/directus/directus/pull/6044) Reduce the image layers by combining RUN statements; and fix
    build permissions for issue #6023 ([@t7tran](https://github.com/t7tran))

### :memo: Documentation

- [#6037](https://github.com/directus/directus/pull/6037) Update one-clicks in readme/docs
  ([@rijkvanzanten](https://github.com/rijkvanzanten))
- [#6033](https://github.com/directus/directus/pull/6033) Fix wrong reference to not-yet-existing /backup endpoint
  ([@rijkvanzanten](https://github.com/rijkvanzanten))

### :package: Dependency Updates

- [#6032](https://github.com/directus/directus/pull/6032) Upgrade dependencies
  ([@rijkvanzanten](https://github.com/rijkvanzanten))
- [#6022](https://github.com/directus/directus/pull/6022) Bump sass from 1.34.0 to 1.34.1
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6021](https://github.com/directus/directus/pull/6021) Bump argon2 from 0.27.2 to 0.28.1
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6020](https://github.com/directus/directus/pull/6020) Bump eslint from 7.26.0 to 7.27.0
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#6018](https://github.com/directus/directus/pull/6018) Bump @types/node from 15.6.0 to 15.9.0
  ([@dependabot[bot]](https://github.com/apps/dependabot))

## v9.0.0-rc.71 (June 2, 2021)

### :rocket: Improvements

- **API**
  - [#6003](https://github.com/directus/directus/pull/6003) Don't initialize database on file require
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#6001](https://github.com/directus/directus/pull/6001) Changed PORT type from number to string
    ([@nichols-green](https://github.com/nichols-green))
- **Docker**
  - :warning: [#5877](https://github.com/directus/directus/pull/5877) Clean-up docker image
    ([@paescuj](https://github.com/paescuj))

### :bug: Bug Fixes

- **API**
  - [#6002](https://github.com/directus/directus/pull/6002) Fix env var validation in database loading step
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#5998](https://github.com/directus/directus/pull/5998) Remove stray console.log in dependency
    ([@rijkvanzanten](https://github.com/rijkvanzanten))

### :memo: Documentation

- [#6006](https://github.com/directus/directus/pull/6006) Added document for running directus on iis
  ([@nichols-green](https://github.com/nichols-green))

### :package: Dependency Updates

- [#5986](https://github.com/directus/directus/pull/5986) Bump marked from 2.0.5 to 2.0.7
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#5985](https://github.com/directus/directus/pull/5985) Bump dompurify from 2.2.8 to 2.2.9
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#5984](https://github.com/directus/directus/pull/5984) Bump jest-environment-jsdom from 26.6.2 to 27.0.3
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#5983](https://github.com/directus/directus/pull/5983) Bump @typescript-eslint/parser from 4.23.0 to 4.26.0
  ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#5982](https://github.com/directus/directus/pull/5982) Bump fs-extra from 9.1.0 to 10.0.0
  ([@dependabot[bot]](https://github.com/apps/dependabot))

## 9.0.0-rc.70 (June 1, 2021)

### :sparkles: New Features

- **API**
  - [#5615](https://github.com/directus/directus/pull/5615) added support for mirroring foreign key constraints with the
    database ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#5795](https://github.com/directus/directus/pull/5795) added support for new environment variables that allow you
    to control maximum asset generation parameters ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#5855](https://github.com/directus/directus/pull/5855) added support for deep filtering on many-to-any items
    ([@rijkvanzanten](https://github.com/rijkvanzanten))

### :rocket: Improvements

- **API**
  - [#5804](https://github.com/directus/directus/pull/5804) treat `uniqueidentifier` in MS SQL as a UUID
    ([@Oreilles](https://github.com/Oreilles))
  - [`e2c9e15`](https://github.com/directus/directus/commit/e2c9e15a981bd7034b1c5dad839a9816148aa594) throw a 503
    service unavailable when the storage adapter crashes during a file upload
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [`02089a6`](https://github.com/directus/directus/commit/02089a6227575a340bbf5b926cf9717a89941138) set the default
    TTL for cache to a more reasonable 10 minutes (from 30) ([@rijkvanzanten](https://github.com/rijkvanzanten))
- **App**
  - [`4277de0`](https://github.com/directus/directus/commit/4277de088988a65f9ea4ea18a4121488a24a8e87) set the default
    value for boolean filters to `true`, preventing confusion around the state of the toggle in advanced filters
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [`a5cba0d`](https://github.com/directus/directus/commit/a5cba0dc7e3a1566095deb58d10297f3b7bbe9bd) prevent unusable
    collections from being selected in the relational setup ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [`4beccb6`](https://github.com/directus/directus/commit/4beccb6a8a9e33d0ae0e47333bfacd60741a91bc) don't allow using
    `_contains` on a UUID ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [`a40d75a`](https://github.com/directus/directus/commit/a40d75a184e2257256a0b1e33fcdcc696e9ad73b) only close menu
    boxes when clicking on menu content, ignore menu box itself ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [`3d3a508`](https://github.com/directus/directus/commit/3d3a508880f0fd51df8a8f05b990c0687fca53f5) allow setting
    on-create and on-update triggers for many-to-one UUID fields ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [`5c66c53`](https://github.com/directus/directus/commit/5c66c53478400261d80113edc3c32186d3fdb6f0) allow rendering a
    translations preview next to the language in the translations interface
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [#5943](https://github.com/directus/directus/pull/5943) allow the user to update it's own profile in the app
    recommended permissions ([@cupcakearmy](https://github.com/cupcakearmy))
- **drive-gcs**
  - [`5704cd4`](https://github.com/directus/directus/commit/5704cd46d28217ac464cea4d2a88356c80fb75f4) improve uploading
    performance ([@rijkvanzanten](https://github.com/rijkvanzanten))

### :bug: Bug Fixes

- **API**
  - [#5763](https://github.com/directus/directus/pull/5763) fixed an issue that could cause updates on o2m items to fail
    ([@MiniDigger](https://github.com/MiniDigger))
  - [#5806](https://github.com/directus/directus/pull/5806) fixed an issue that could cause `_or` filters to
    shortcircuit ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [`95307ce`](https://github.com/directus/directus/commit/95307cee979940558fafd8f822bc9fe8083bd526) fixed an issue
    that would prevent nested one to many item updates to store the correct parent revision
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
- **App**
  - [#5810](https://github.com/directus/directus/pull/) fixed custom fields on system collections not aligning to the
    configured sort order ([@rijkvanzanten5810](https://github.com/rijkvanzanten5810))
  - [`158316f`](https://github.com/directus/directus/commit/158316f86318e83de5d5e6e203306a5603458c6d) fixed a small
    issue that would prevent the advanced filter field selection from allowing multiple nested fields from being opened
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [`246c552`](https://github.com/directus/directus/commit/246c55266b78ae063408dbc1b04d1797bd85e476) fixed an issue
    that would require non-null fields to be submitted in every GraphQL mutation
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [`5506214`](https://github.com/directus/directus/commit/550621479e3b9173f963a0bd723595213f56dedb) fixed fallback
    interface for `boolean` type fields ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [`b782eba`](https://github.com/directus/directus/commit/b782eba859d0a91d08dfd39ab41e6952db0c94b7) fixed an issue
    that would make custom field translations disappear when reordering the fields in settings
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [`bd6cab8`](https://github.com/directus/directus/commit/bd6cab8989ea8a8af3b0848c51ee9b3fae289ab3) fixed an issue
    that would cause the relational setup to auto generate an invalid name when making a recursive many-to-many field
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [`8590eec`](https://github.com/directus/directus/commit/8590eec662364ce8c865b529394f271b8b46a1c7) fix collection
    search when using custom nav override structure ([@Oreilles](https://github.com/Oreilles))
  - [`dee8160`](https://github.com/directus/directus/commit/dee8160f184af4f041580d76ce88da5dc3eb0d12) fixed an issue
    where dragging an event in the calendar layout could save with the wrong timezone when using a datetime field
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [`374e6e5`](https://github.com/directus/directus/commit/374e6e5a7dd3d752a25c352df7ce5f661a5b15c1) don't let v-error
    messages overflow the bounding box of the dialog ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [`2660c39`](https://github.com/directus/directus/commit/2660c3995426dd3d8d36a8022893cddcd27ed53f) fixed an issue
    that would prevent the user from continuing in field setup when using an existing junction table for a many-to-many
    relationship ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [`de0b962`](https://github.com/directus/directus/commit/de0b9627365b392d4af0589a52b122cf0b5ec927) fixed the
    highlight color of a selected folder in the move-folder dialog ([@rijkvanzanten](https://github.com/rijkvanzanten))
- **drive-azure**
  - [#5788](https://github.com/directus/directus/pull/) fixed an issue that would cause file reads from S3/Azure to be
    double-prefixed with the storage root option ([@aidenfoxx](https://github.com/aidenfoxx))
- **drive-s3**
  - [#5788](https://github.com/directus/directus/pull/) fixed an issue that would cause file reads from S3/Azure to be
    double-prefixed with the storage root option ([@aidenfoxx](https://github.com/aidenfoxx))
  - [`eb68195`](https://github.com/directus/directus/commit/eb68195cd5cd72ab16b5480f80162e9c94b7d004) fixed an issue
    that would cause issues when leaving ACL empty ([@rijkvanzanten](https://github.com/rijkvanzanten))
  - [`925c3fa`](https://github.com/directus/directus/commit/925c3fa3fa4b8ad34801ecb17c954e3b0c4a19a1) fixed an issue
    that would prevent Range header requests from sending the correct chunk of data
    ([@rijkvanzanten](https://github.com/rijkvanzanten))
- **gatsby-source-directus**
  - [`48cdf6e`](https://github.com/directus/directus/commit/48cdf6e0835b6e077cb0641be30d49483c611439) fixed static token
    support ([@TheAzack9](https://github.com/TheAzack9))
- **schema**
  - [#5816](https://github.com/directus/directus/pull/5816) ignore views when reading tables in MS SQL
    ([@wc-matteo](https://github.com/wc-matteo))

### :memo: Documentation

- added additional information on sort setup\
  ([@benhaynes](https://github.com/benhaynes))
- [#5750](https://github.com/directus/directus/pull/5750) fixed a couple typos in email-templates
  ([@larssobota](https://github.com/larssobota))
- [`477c36d`](https://github.com/directus/directus/commit/477c36d86771190f8c314b0fa641a86f3ee1a3fb) made sure that the
  latest version of the Docker image is used when copy pasting the docker-compose example
  ([@rijkvanzanten](https://github.com/rijkvanzanten))
- [`c0182d7`](https://github.com/directus/directus/commit/c0182d7b14e31e8fe9d3103082fcedcbbda5dd99) improved the issue
  template for new issues on GitHub ([@benhaynes](https://github.com/benhaynes))
- [`5f4a24d`](https://github.com/directus/directus/commit/5f4a24d45637fdb2b5b2cb024002c5b6434e35b0) added a note on
  sending relational data to the Data Access page ([@moekify](https://github.com/moekify))
- [`7f5e59b`](https://github.com/directus/directus/commit/7f5e59b1174f5d1ce12103f823001d53f8364295) fixed the links to
  the API reference in the environment variable overview ([@cosminepureanu](https://github.com/cosminepureanu))
- [`56ad3c0`](https://github.com/directus/directus/commit/56ad3c04dd0b350905aa23f2483045219a1a6502) remove Patreon in
  favor of GitHub Sponsors ([@benhaynes](https://github.com/benhaynes))
