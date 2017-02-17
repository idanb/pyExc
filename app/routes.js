var Script = require('./models/script');
var PythonShell = require('python-shell');
var fs = require('fs');
var debug = require('debug')('http');
var serviceHandler = {
    pyShellOptions: {
        mode: 'text',
        scriptPath: process.cwd() + '/app/scripts_tmp'
    },
    getScripts: function(res){
        Script.find(function (err, scripts) {
            if (err) {
                res.send(err);
            }
            res.json(serviceHandler.responseTemplate(202,scripts)); // return all scripts in JSON format
        });
    },
    responseTemplate: function(status,res){
        return {'status': status, 'response': res};
    }

}

//CRUD execution related errors
//{"status":220,"response":"success"}}
//{"status":-201,"response":"mongo error"}
//{"status":-202,"response":"server error"}

// Python execution related errors
//{"status":0,"response":"success"}}
//{"status":-1,"response":"write script to file error before execution"}
//{"status":-2,"response":"script not exist"}
//{"status":-3,"response":"script error"}
//{"status":-4,"response":"timeout error"}

module.exports = function (app) {
    // api -------------------------------------------------------
    // get all scripts
    app.get('/api/scripts', function (req, res) {
        // use mongoose to get all scripts in the database
        serviceHandler.getScripts(res);
    });

    // run script by name
    app.get('/api/script/:script_name', function (req, res) {
        var isTimeOut = false;
        Script.find({ name: req.params.script_name
        },function (err, script) {
            if (err)
                res.send(err);

            if (!script.length) {
                res.send(serviceHandler.responseTemplate(-2,"script not exist"));
                return new Error(serviceHandler.responseTemplate(-2,"script not exist"));
            }

            var file = process.cwd() + "/app/scripts_tmp/my_script.py";
            fs.writeFile(file, script[0].script, function(err) {
                if(err) {
                    return new Error(serviceHandler.responseTemplate(-2,err));
                }
                console.log("execution file updated by script");
            });

            var timeOut = setTimeout(function() {
                isTimeOut = true;
            }, 3000); // 3 seconds

            PythonShell.run('my_script.py', serviceHandler.pyShellOptions, function (err, results) {
                var res_data;
                if (err)  {
                    res_data = serviceHandler.responseTemplate(-1,err);
                }
                else if (isTimeOut)  {
                    res_data = serviceHandler.responseTemplate(-4,"running script timeout error");
                }
                else {
                    // results is an array consisting of messages collected during execution
                    console.log('results: %j', results);
                    res_data = serviceHandler.responseTemplate(0,results);
                }
                clearTimeout(timeOut);
                res.json(res_data);
                return;
            });
        });
    });

    // create script and send back all scripts after creation
    app.post('/api/scripts', function (req, res) {

        // create a script, information comes from AJAX request from Angular
        Script.create({
            script: req.body.script,
            name: req.body.name + "_copy"
        }, function (err, script) {
            if (err)
                res.send(err);

            // get and return all the scripts after you create new one
            serviceHandler.getScripts(res);
        });

    });

    // delete a script and send back all scripts after creation
    app.delete('/api/script/:script_name', function (req, res) {
        Script.remove({
            name: req.params.script_name
        }, function (err, script) {
            if (err)
                res.send(err);
            serviceHandler.getScripts(res);
        });
    });

    // update script and send back all scripts after updating
    app.put('/api/script/:script_id', function (req, res) {

        Script.findById(req.params.script_id,function (err, script) {
            if (err)
                res.send(err);
            script.script = req.body.script;
            script.name = req.body.name;
            script.save(function (err, script) {
                if (err) {
                    res.json(serviceHandler.responseTemplate(-2,err));
                    return;
                }
                serviceHandler.getScripts(res);
            });
        });
    });

    // application -------------------------------------------------------------
    app.get('*', function (req, res) {
        res.sendFile(__dirname + '/public/index.html'); // load view
    });
};
