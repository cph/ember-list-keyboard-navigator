# CHANGELOG

### v0.2.0
* **[breaking]** - Increased the minimum version of Node to 12 (#28)
* **[fix]** - Updated `printf` to address CVE (#28)
* **[improvement]** - Used GitHub Actions for testing

### v0.1.1
* **[fix]** - Fixed an issue autoscrolling with some item selectors (#17)

### v0.1.0
* **[improvement]** - Refactored to use glimmer components (#16)
* **[breaking]** - The `focused` param is no longer two-way bound; you must use the `onFocusIn` and `onFocusOut` actions to observe and update the param passed in to `focused`. (#16)

### v0.0.5
* **[fix]** - Bumped eslint-utils to 1.4.3 to address CVE (#9)
* **[fix]** - Bumped js-yaml to 3.13.1 to address CVE (#10)
* **[fix]** - Bumped lodash to 4.17.19 to address CVE (#15)
* **[fix]** - Bumped lodash.merge to 4.6.2 to address CVE (#11)
* **[fix]** - Bumped lodash.defaultsdeep to 4.6.1 to address CVE (#12)

### v0.0.4
* **[improvement]** - Removed direct reliance on jQuery (#5)
* **[improvement]** - Upped Node.js minimum version to 8 (#5)
* **[fix]** - Bumped mixin-deep to 1.3.2 to address CVE (#6)
* **[fix]** - Bumped handlebars to 4.5.3 to address CVE (#7)
* **[fix]** - Bumped jquery (for development) to 3.5.0 to address CVE (#8)
* **[improvement]** - Added changelog (#8)
