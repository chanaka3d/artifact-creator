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
6. Extract all the above zip files ( product, feature archives ) at the same location.

Example.


Note1: The folder structure is important.
Note2: The gen.js copied at the same location.

Open the gen.js and update the following section according to the patch number and product version.

```js
// ******************************************************** //
// ******************************************************** //
// ******************************************************** //
//          This part need to modified accordingly          //
const jars = [
   // {
   //     jarName: 'org.wso2.carbon.apimgt.publisher.feature-6.7.206',
   //     appContext: 'publisher',
   // },
   {
       jarName: 'org.wso2.carbon.apimgt.store.feature-6.7.206',
       appContext: 'devportal',
   },
   {
       jarName: 'org.wso2.carbon.apimgt.admin.feature-6.7.206',
       appContext: 'admin',
   }
]
 
 
const productName = 'wso2am-3.2.0';
const artifactFolderName = '0551';
 
 
// ******************************************************** //
// ******************************************************** //
// ******************************************************** //
```

Note: You need to comment out the unwanted webapps.

Open a terminal and run the following command.

```bash
node gen.js
```

The following output will be shown.

```bash
/folderpath/0551/devportal/site/public/dist  created 
/folderpath/0551/admin/site/public/pages  created 
7 files to added to the devportal dist folder
7 files removed from the old pack's devportal dist folder
/folderpath/0551/admin/site/public/dist  created 
4 files to added to the admin dist folder
4 files removed from the old pack's admin dist folder
run-in-pmt.js file is saved
```

You need to commit the generated folder to the correct repo parth.

Next, you need to go to the “PR analysis screen” and run the run-in-pmt.js. To run the script you need to open the developer tools “Console” tab and paste the content and press “Return/Enter”

