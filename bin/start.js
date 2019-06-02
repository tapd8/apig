#!/usr/bin/env node
;(function () {

    const homeDIR = require('os').homedir();
    const configDIR = homeDIR + "/.moa";
    const moaConfigFile = homeDIR + '/.moa/moa.json';
    const apiConfigFile = homeDIR + '/.moa/api.json';

    var args = process.argv.slice(2)
    var startMode = 'local';
    if (args && args.length > 0) {
        startMode = args[0] == 'login' ? 'cloud' : startMode;
    }

    try {

        if (startMode == 'local') {
            initialLocalMode(configDIR, moaConfigFile, apiConfigFile);
        } else {
            initialCloudMode(configDIR, moaConfigFile);
        }

    } catch (e) {
        console.log("Start up api server failed " + e);
    }

})();

function login(request, moaConfig, response, callback) {
    var loginResult = undefined;
    request.post({
        url: moaConfig.server.uri + "/api/users/login",
        form: {
            email: response.username,
            password: response.password
        }
    }, (err, response, body) => {
        if (err) {
            console.error('Login failed ', err);
        } else if (response.statusCode === 200) {
            loginResult = JSON.parse(body);
            callback(loginResult);
            console.log('Login succeeded.');

        } else {
            console.error('Login failed ', body);
        }
    });

    return loginResult;
}

function getAPIServerConfigFile(fs, moaConfig, loginResult, apiServerConfig, callback) {
    const http = require('http');

    const configFileName = "apiServerConfig.js";
    const configFile = fs.createWriteStream(configFileName);
    var downloadConfigURL = moaConfig.server.uri + "/api/ApiServers/download/" + apiServerConfig.id + "?access_token=" + loginResult.id;


    console.log("Download config file from url ", downloadConfigURL);
    http.get(downloadConfigURL, function(res) {
        res.on('data', function(data) {
            configFile.write(data);
        }).on('end', function() {
            configFile.end();
            configFile.close();
            callback("../" + configFileName);
        });
    });

    // http.get(downloadConfigURL, function (response) {
    //     response.pipe(configFile);
    //     if (configFile) {
    //         configFile.close();
    //     }
    //
    //     callback(configFile);
    // });

}

function getApiServerConfig(request, moaConfig, loginResult, callback) {
    request.get({
        url: moaConfig.server.uri + "/api/ApiServers?filter[limit]=1&filter[skip]=0&filter[order]=clientName+desc&access_token=" + loginResult.id
    }, (err, response, body) => {
        if (err) {
            console.error('Login failed ', err);
        } else if (response.statusCode === 200) {
            var ret = JSON.parse(body);
            if (Array.isArray(ret) && ret.length > 0) {
                callback(ret[0]);
            }

        } else {
            console.error('Login failed ', body);
        }
    });
}

function initialCloudMode(configDIR, moaConfigFile) {

    const prompts = require('prompts');

    const questions = [
        {
            type: 'text',
            name: 'username',
            message: 'Username (If it does not exist, it will be automatically registered):',
            validate: value => value ? true : "Username cannot be blank."
        },
        {
            type: 'text',
            name: 'password',
            message: 'Password:',
            validate: value => value ? true : "Password cannot be blank."
        }
    ];

    (async () => {
        const response = await prompts(questions);

        if (!response.username || !response.password) {
            console.log("username/password cannot be blank.");
            return;
        }

        const fs = require('fs');
        if (!fs.existsSync(configDIR)) {
            console.log("Moa dir does not exists." + configDIR);
            fs.mkdir(configDIR, {recursive: true}, err => {
                if (err) {
                    console.log("Create moa dir failed " + err);
                }
            })
        }

        if (!fs.existsSync(moaConfigFile)) {
            var moaConfigTemplate = require("../config_template/cloudmoaconfig.json");
            writeConfigFile(moaConfigFile, moaConfigTemplate);
        }

        var moaConfig = readConfig(moaConfigFile);

        const request = require('request');

        login(request, moaConfig, response, loginResult => {

            getApiServerConfig(request, moaConfig, loginResult, apiServerConfig =>{
                getAPIServerConfigFile(fs, moaConfig, loginResult, apiServerConfig,apiServerConfigFile => {
                    var apiServerConfig = require(apiServerConfigFile);
                    if (apiServerConfig) {
                        moaConfig.host = apiServerConfig.host;
                        moaConfig.port = apiServerConfig.port;
                        moaConfig.jwtSecretKey = apiServerConfig.jwtSecretKey;
                        moaConfig.server.accessCode = apiServerConfig.tapDataServer.accessCode;
                        moaConfig.server.process_id = apiServerConfig.reportData.process_id;
                    }

                    writeConfigFile(moaConfigFile, moaConfig);

                });
            });
        });

    })();

}
function initialLocalMode(configDIR, moaConfigFile, apiConfigFile) {
    const fs = require('fs');

    if (!fs.existsSync(configDIR)) {
        console.log("Moa dir does not exists." + configDIR);
        fs.mkdir(configDIR, {recursive: true}, err => {
            if (err) {
                console.log("Create moa dir failed " + err);
            }
        })
    }

    if (!fs.existsSync(moaConfigFile)) {

        var moaConfigTemplate = require("../config_template/localmoaconfig.json");
        writeConfigFile(moaConfigFile, moaConfigTemplate);
    }
    if (!fs.existsSync(apiConfigFile)) {

        var apiConfigTemplate = require("../config_template/localapiconfig.json");
        writeConfigFile(apiConfigFile, apiConfigTemplate);
    }

    let moaConfig = readConfig(moaConfigFile);
    let apiConfig = readConfig(apiConfigFile);

    if (!moaConfig || !apiConfig) {
        console.log("Must be contain moa config and api config in local start up mode.")
    }
}

function writeConfigFile(filePath, config) {
    const fs = require('fs');

    var configObj = JSON.stringify(config, null, 4);
    fs.writeFileSync(filePath, configObj, {encoding: "UTF-8"});
}

function readConfig(filePath) {
    const fs = require('fs');
    return JSON.parse(fs.readFileSync(filePath, {encoding: "UTF-8"}));
}

