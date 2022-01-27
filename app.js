require('dotenv').config()
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
let user = 'admin';

const absolutePath = path.join(__dirname, `../export-sn-update-sets/update_set_exports/${user}`);

function getFileNames(directory) {
    let fileNames = [];
    fs.readFileSync(directory).forEach(file => {
        fileNames.push(file);
    })
}

let files = getFileNames(absolutePath);
const url = process.env.INSTANCE;

uploadUpdateSets(url, absolutePath, files);

async function uploadUpdateSets(url, directory, files) {
    try {
        const URL = `${url}/login.do`
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const userName = process.env.USER_NAME;
        const password = process.env.PASSWORD;

        await page.goto(URL);
        await page.type('#user_name', userName);
        await page.type('#user_password', password);
        await page.click('#sysverb_login');
        await page.waitForNavigation();

        files.forEach(file => {
            await page.goto(`${url}/upload.do?sysparm_referring_url=sys_remote_update_set_list.do?sysparm_fixed_query=sys_class_name=sys_remote_update_set&sysparm_target=sys_remote_update_set`);

            const [fileChooser] = await Promise.all([page.waitForFileChooser(), page.click('#attachFile')]);
            await fileChooser.accept([`${directory}/${file}`]);
            await page.click('input[type=submit]');
        })

        await browser.close();
    } catch (error) {
        console.log(error);
    }
}