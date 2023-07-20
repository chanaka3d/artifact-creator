# artifact-creator
Prerequisite: Node 12.x ( will not work with 14, 10 etc.. ) Use NVM to install node 12.

This helps to create support artifacts for the update-artifacts repo and provide an easy way to add them during the PR Analysis phase.

This script will generate the following.

```
The artifacts folder
run-in-pmt.js
```

1. Get the latest live updated product.
2. Merge all support PRs
3. Trigger the Jenkins build.
4. Download each feature builds from the Jenkins after the build is successful.
5. Clone or download the gen.js from this repo.
6. Extract all the above zip files ( product, feature archives ) at the same location as shown below.
7. Go to the extracted Jenkins snapshot and locate the war file named after the relevant portal ( publisher.war/devportal.war/admin.war)
8. Extract the war file in the same location to create the relevant portal folder ( publisher/devportal/admin)

Example.

```bash
.
├── gen.js
├── org.wso2.carbon.apimgt.ui.publisher-9.0.432.19-SNAPSHOT
│     ├── plugins
│     └── features
│           └── org.wso2.carbon.apimgt.ui.publisher.feature_9.0.432.19-SNAPSHOT 
│                 └── publisher.war 
└── wso2am-4.2.0
    ├── INSTALL.txt
    ├── LICENSE.txt
    ├── README.txt
    ├── XMLInputFactory.properties
    ├── bin
    ├── business-processes
    ├── dbscripts
    ├── lib
    ├── modules
    ├── release-notes.html
    ├── repository
    ├── resources
    ├── samples
    ├── tmp
    └── updates
```

- Note1: The folder structure is important.
- Note2: The gen.js copied at the same location.

9. Open the gen.js, uncomment and rename the jars section to match your Jenkins zip file 

```js
// ******************************************************** //
// ******************************************************** //
// ******************************************************** //
//          This part need to modified accordingly          //
const jars = [
   // {
   //     jarName: 'org.wso2.carbon.apimgt.ui.publisher-9.0.432.2-SNAPSHOT',
   //     appContext: 'publisher',
   // },
   {
       jarName: 'org.wso2.carbon.apimgt.ui.devportal-9.0.432.2-SNAPSHOT',
       appContext: 'devportal',
   },
   {
       jarName: 'org.wso2.carbon.apimgt.ui.admin-9.0.432.2-SNAPSHOT',
       appContext: 'admin',
   }
]
// ******************************************************** //
// ******************************************************** //
// ******************************************************** //
```

Note: You need to comment out the unwanted webapps.

10. Open a terminal and run the following command. A folder will be created with a number.

```bash
node gen.js
```

The following output will be shown.

```bash
/folderpath/0551/devportal/site/public/dist  created 
/folderpath/0551/admin/site/public/pages  created 
7 files to added to the devportal dist folder
7 files removed from the old pack's publisher dist folder
/folderpath/0551/admin/site/public/dist  created 
4 files to added to the admin dist folder
4 files removed from the old pack's admin dist folder
run-in-pmt.js file is saved
```


11. Click the `Manual File` button in Pull Request Analysis U2 page. Copy the context in the `u2-removed-file-list.txt` file and paste on the `File path in the product pack`. Select `removed` as the file operation.
12. Add files in the `<folder_number>/<portal>/site/public/dist` (4570/publisher/site/public/dist) as `added` files with the correct file path in the pack.
13. `index.jsp` file which is in the `pages` folder should be added as a `modified` file.
14. Also add the files you changed for the fix as modified files.
