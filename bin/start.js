#!/usr/bin/env node

const homeDIR = require('os').homedir();
const configDIR = homeDIR + "/.moa";
;(function () {
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

    const configFileName = configDIR + "/apiServerConfig.js";
    const configFile = fs.createWriteStream(configFileName);
    var downloadConfigURL = moaConfig.server.uri + "/api/ApiServers/download/" + apiServerConfig.id + "?access_token=" + loginResult.id;


    console.log("Download config file from url ", downloadConfigURL);
    http.get(downloadConfigURL, function(res) {
        res.on('data', function(data) {
            configFile.write(data);
        }).on('end', function() {
            configFile.end();
            configFile.close();
            callback(configFileName);
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
            validate: value => {
	            if( !value)
                    return "Username cannot be blank.";
	            if( !/^[A-Za-z0-9\u4e00-\u9fa5_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(value))
	                return "Invalid email-address";
                return true;
            }
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
                        moaConfig.listen_host = apiServerConfig.host;
                        moaConfig.listen_port = apiServerConfig.port;
                        moaConfig.jwtSecretKey = apiServerConfig.jwtSecretKey;
                        moaConfig.server.accessCode = apiServerConfig.tapDataServer.accessCode;
                        moaConfig.server.process_id = apiServerConfig.reportData.process_id;
                    }

                    writeConfigFile(moaConfigFile, moaConfig);

                    startServer(moaConfig, apiServerConfig, moaConfigFile, apiServerConfigFile);
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

    startServer(moaConfig, apiConfig, moaConfigFile, apiConfigFile);
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

/**
 * start api server
 * 1. check $app_home/dist exists
 * 2. none exists run `npm start` else run `node index.js`
 */
function startServer(moaConfig, apiConfig, moaConfigFile, apiConfigFile){
    const cp = require('child_process');
	const path = require('path');
	const fs = require('fs');
	const appHome = path.join(__dirname, '../');
	const dist = path.join(appHome, 'dist');
	const configDir = path.dirname(moaConfigFile);
	const start = function(){
		moaConfig.server = moaConfig.server || {};

		console.log(moaConfig)

		cp.fork(path.join(appHome, 'index.js'), {
		    cwd: appHome,
			detached: false,
			env: Object.assign({
                'API_SERVER_PORT': moaConfig.listen_port,
                'API_SERVER_HOST': moaConfig.listen_host,

                'MODEL': moaConfig.mode,
                'API_FILE': moaConfig.api.startsWith('/') ? moaConfig.api : path.join(configDir, moaConfig.api),
                'CACHE_DIR': moaConfig.cacheDir.startsWith('/') ? moaConfig.cacheDir : path.join(configDir, moaConfig.cacheDir),
                'LOG_DIR': moaConfig.logDir.startsWith('/') ? moaConfig.logDir : path.join(configDir, moaConfig.logDir),
                'JWT_SECRET_KEY': moaConfig.jwtSecretKey,

                'TAPDATA_ORIGIN': moaConfig.server.uri || '',
                'TAPDATA_ACCESS_CODE': moaConfig.server.accessCode || '',
                'API_SERVER_ID': moaConfig.server.process_id || '',
            }, process.env)
        })
    };
	if( !fs.existsSync(dist )) {
		const buildCp = cp.spawn('npm', ["run", "build"], {
            cwd: appHome,
            encoding: 'utf8',
			detached: false,
			stdio: 'inherit'
        });
		buildCp.on('close', start);
    } else {
        start();
    }
}
