//requiring path and fs modules
const path = require('path');
const fs = require('fs');

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
    // {
    //     jarName: 'org.wso2.carbon.apimgt.admin.feature-9.0.174',
    //     appContext: 'admin',
    // }
]


const productName = 'wso2am-3.2.0';
const artifactFolderName = '1135';

const wikeOrWikeson = 'wilkinson'; // Set this also accordingly ( for 3.0 we need to set this to 'wilkes' )
// ******************************************************** //
// ******************************************************** //
// ******************************************************** //

let adminAppHasChanges = false;
let publisherAppHasChanges = false;

const fileExistsInPack = (appName, fileNameInJar) => {
    //joining path of directory 
    const directoryPath = path.join(__dirname, `${productName}/repository/deployment/server/jaggeryapps/${appName}/site/public/dist`);
    //passing directoryPath and callback function
    const files = fs.readdirSync(directoryPath);
    
    //listing all files using forEach
    return files.filter(f => f === fileNameInJar).length > 0;
}

const getFilesToRemoveFromPack = (appName, sameFiles) => {
    //joining path of directory 
    const directoryPath = path.join(__dirname, `${productName}/repository/deployment/server/jaggeryapps/${appName}/site/public/dist`);

    const filesToRemove = [];
    //passing directoryPath and callback function
    const files = fs.readdirSync(directoryPath);
    files.forEach(function (file) {
        let fileExists = sameFiles.filter(f => f === file).length > 0;

        if (!fileExists) {
            filesToRemove.push(file);
        }

    });
    return filesToRemove;
}
const genScriptFile = (filesToRemoveFromPack, newFilesAdded) => {
    if(adminAppHasChanges) {
        newFilesAdded.push("'admin/site/public/pages/index.jag'");   
        filesToRemoveFromPack.push("'admin/site/public/pages/index.jag'");
    }
    if(publisherAppHasChanges && productName === 'wso2am-4.0.0') {
        newFilesAdded.push("'publisher/site/public/pages/index.jag'");   
        filesToRemoveFromPack.push("'publisher/site/public/pages/index.jag'");
    }
    
    const script = `
        var xoFiles_added = [
        ${newFilesAdded.join(',\n')}];
         
         
        var xoFiles_removed = [
        ${filesToRemoveFromPack.join(',\n')}]
          
        var gitRepoRoot = 'https://github.com/wso2-support/update-artifacts/blob/master/${wikeOrWikeson}/${artifactFolderName}/';
        var productRoot = 'repository/deployment/server/jaggeryapps/';

        $(document).ready(function () {
            for (var i = 0; i < xoFiles_added.length; i++) {
                var markup = "<tr><td colspan='7' style='padding: 5px'><a href='" + gitRepoRoot + xoFiles_added[i] + "'>" + gitRepoRoot + xoFiles_added[i] + "</a>" +
                    "<p style='font-size: 12px'>" + productRoot + xoFiles_added[i] + "</p></td><td><img onclick='return deleteFiles(this)' class='delete-btn' src='../../images/icons/ic_delete_black.png' /></a></td></tr>";
                $("#addedFilesTable tbody").append(markup);
            }
            for (var i = 0; i < xoFiles_removed.length; i++) {

                var markup2 = "<tr><td colspan='7' style='padding: 5px'><a href='" + productRoot + xoFiles_removed[i] + "'>" + productRoot + xoFiles_removed[i] + "</a></td><td><img onclick='return deleteFiles(this)' class='delete-btn' src='../../images/icons/ic_delete_black.png' /></a></td></tr>";
                $("#removedFilesTable tbody").append(markup2);
            }

        })
    
    `;


    fs.writeFile("run-in-pmt.js", script, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("run-in-pmt.js file is saved");
    });

    var onlyRemove = filesToRemoveFromPack.filter(f => {
        return(f.indexOf('manifest.json') === -1 && f.indexOf('index.jag') === -1);
    });
    const fileListU2 = `${onlyRemove.map(f => `repository/deployment/server/jaggeryapps/${f.replace(/\'/g, '')}`).join(';')}`;

    fs.writeFile("u2-removed-file-list.txt", fileListU2, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("u2-removed-file-list.txt file is saved");
    });

}
const analyzeJarFiles = (appName, jarName) => {
    //joining path of directory 
    const directoryPath = path.join(__dirname, `${jarName}/features/${jarName.replace('.feature-', '_')}/${appName}/site/public/dist`);
    //passing directoryPath and callback function
    const newFilesAdded = [];
    const sameFiles = [];
    const files = fs.readdirSync(directoryPath);
    //listing all files in the jar dist folder
    files.forEach(function (file) {
        if (fileExistsInPack(appName, file)) {
            sameFiles.push(file);
        } else {
            newFilesAdded.push(file);
        }
    });

    // Now from the same files in the packs we can get the files to remove from the previous wum updated pack
    const filesToRemoveFromPack = getFilesToRemoveFromPack(appName, sameFiles);

    // ****** //
    // Adding the new files to the artifacts folder.
    if(newFilesAdded.length > 0 ){
        const destinationFileLocation = path.join(__dirname, `${artifactFolderName}/${appName}/site/public/dist`);
        if (!fs.existsSync(destinationFileLocation)) {
            fs.mkdirSync(destinationFileLocation, { recursive: true });
            console.log(destinationFileLocation + '  created ')
        }
        // We need to copy the manifest.json file since even if one file is updated, it requires to copy this file.
        if(appName === 'devportal' || (appName === 'publisher' && productName !== 'wso2am-4.0.0')) {
            // If admin app we need to copy the index.jag file
            newFilesAdded.push('manifest.json');
            filesToRemoveFromPack.push('manifest.json');
        } else {
            const adminPageLocation = path.join(__dirname, `${artifactFolderName}/${appName}/site/public/pages`);
            const adminPageLocationNew = path.join(__dirname, `${jarName}/features/${jarName.replace('.feature-', '_')}/${appName}/site/public/pages`);
            if (!fs.existsSync(adminPageLocation)) {
                fs.mkdirSync(adminPageLocation, { recursive: true });
                console.log(adminPageLocation + '  created ');
                fs.copyFileSync(`${adminPageLocationNew}/index.jag`, `${adminPageLocation}/index.jag`, (err) => {
                    console.log(err);
                });
            }
        }
        if(appName === 'admin') {
            adminAppHasChanges = true;
         }
         if(appName === 'publisher') {
            publisherAppHasChanges = true;
         }
        newFilesAdded.forEach((newFileAdded) => {
            
            fs.copyFileSync(`${directoryPath}/${newFileAdded}`, `${destinationFileLocation}/${newFileAdded}`, (err) => {
                console.log(err);
            });
        });
    }
    
    console.log(newFilesAdded.length + ' files to added to the ' + appName + ' dist folder');
    console.log(filesToRemoveFromPack.length + ' files removed from the old pack\'s ' + appName + ' dist folder');
    return ({filesToRemoveFromPack, newFilesAdded});
}

let allFilesToRemoveFromPack = [];
let allNewFilesAdded = [];
jars.forEach( jar => {
    const analyzed = analyzeJarFiles(jar.appContext, jar.jarName);
    const {filesToRemoveFromPack, newFilesAdded} = analyzed;
    for (var i = 0; i < filesToRemoveFromPack.length; i++) {
        filesToRemoveFromPack[i] = `'${jar.appContext}/site/public/dist/${filesToRemoveFromPack[i]}'`;
    }
    allFilesToRemoveFromPack = allFilesToRemoveFromPack.concat(filesToRemoveFromPack);

    for (var i = 0; i < newFilesAdded.length; i++) {
        newFilesAdded[i] = `'${jar.appContext}/site/public/dist/${newFilesAdded[i]}'`;
    }
    allNewFilesAdded = allNewFilesAdded.concat(newFilesAdded);
});

genScriptFile(allFilesToRemoveFromPack, allNewFilesAdded);
// Generating the script to run in PMT.




