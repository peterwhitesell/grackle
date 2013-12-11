// ==========================================
// grackle
// CORE: The core class definition
// ==========================================
// Copyright 2013 Modern Media, Inc
// Licensed under the Apache License v2.0
// http://www.apache.org/licenses/LICENSE-2.0
// ==========================================
var
    path = require('path')
    ,fs = require('fs')
    ,exec = require('child_process').exec
    ,_ = require('underscore');

function Grackle(){
    this.help = 'help...';
    this.error_art = 'error...';

    this.opt = require('optimist')

        .boolean('h')
        .alias('h', 'help')
        .default('h', false)
    ;
    this.busy = {};


    this.argv = this.opt.parse(process.argv);
    var args = this.argv._.slice(2);

    if (this.argv.help){
        console.log(this.help);
        process.exit();
    }


    if (args.length < 1){
        this.error_exit([
            'Too few arguments.'
        ]);
    }

    this.start = {};
    this.paths = _.object(['sources'], args);
    this.watching = {};

    this.validateSources(this.paths.sources);
    this.sources = require(this.paths.sources);
    for(var configName in this.sources){
        this.busy[configName] = false;
        this.sources[configName] = this.validateConfig(configName, this.sources[configName]);
        this.watching[configName] = this.watchConfig(configName, this.sources[configName]);
    }
}

Grackle.prototype.validateSources = function(sources_path){
    sources_path = path.resolve(sources_path);
    if (! this.fileExists(sources_path)){
        this.error_exit([
            'Specify a configuration file.'
            , 'Configuration path: ' + sources_path
        ]);
    }
    this.paths.sources = path.resolve(this.paths.sources);
};

Grackle.prototype.validateConfig = function(configName, config){
    console.log("Validating " + configName);
    if (! this.fileExists(config.watch)){
        this.error_exit([
            'Specify a file for me to watch.'
            , 'Watch: ' + config.watch
        ]);
    }
    config.watch = path.resolve(config.watch);
    if (! this.dirExists(config.source)){
        this.error_exit([
            'Specify a single source directory for me to copy from.'
            , 'Source: ' + config.source
        ]);
    }
    config.source = this.stripTrailingSlash(config.source);
    config.source = path.resolve(config.source);

    if ('' != path.extname(config.target)){
        //then we're dealing with a file path...
        if (! this.dirExists(config.target)){
            var d = path.dirname(config.target);
            if (! this.dirExists(d)){
                this.error_exit([
                    'The directory doesn\'t exist for me to copy into.'
                    , 'Target: ' + config.target
                ]);
            }
        }

    } else {
        //we're dealing with a directory path
        if (! this.dirExists(config.target)){
            this.error_exit([
                'Specify a directory for me to copy into.'
                , 'Target: ' + config.target
            ]);
        } else {
        }
    }
    config.target = path.resolve(config.target);
    return config;
};


Grackle.prototype.watchConfig = function(configName, config){
    this.isWatching(configName, config);
    var that = this;
    return fs.watch(
        config.watch, function(event, filename){
            if(!that.busy[configName]){
                that.start[configName] = new Date();
                that.busy[configName] = true;
                console.log('');
                console.log(filename, event + 'd');
                console.log("Starting to copy " + configName);
                console.log('Copying to ' + config.target + '. . .');

                var exclude = "";
                if(config.exclude){
                    exclude = "--exclude-from " + config.exclude + " --delete-excluded ";
                }

                cmd = "rsync -av --delete " + exclude + config.source + ' ' + config.target;
                exec(
                    cmd,
                    function(error, stdout, stderr){
                        that.busy[configName] = false;
                        that.watchCallback(configName, error, stdout, stderr);
                    }
                );

            }
        }
    );
};


Grackle.prototype.isWatching = function(configName, config){
    console.log('');
//    console.log(this.art);
    console.log('Watching ' + configName + '...');
    console.log('Watch:          ' + config.watch);
    console.log('Source:         ' + config.source);
    console.log('Target:         ' + config.target);
    if(config.exclude){

        console.log('Exclude:        ' + config.exclude);
    }
    console.log('')
};
Grackle.prototype.watchCallback = function (configName, error, stdout, stderr) {
    if (error !== null) {
        console.log (this.error_art);
        console.log(error.message);
    } else {
        var d = new Date();
        var elapsed = (d.getTime() - this.start[configName].getTime())/1000;
        console.log('Copied ' + configName + ' in '+ elapsed + ' seconds.')
    }
    this.watching[configName].close();
    this.watchConfig(configName, this.sources[configName]);
};

Grackle.prototype.dirExists = function(p){
    if (fs.existsSync(p)){
        var s = fs.statSync(p);
        if (s.isDirectory()) return true;
    }
    return false;
};
Grackle.prototype.fileExists = function(p){
    if (fs.existsSync(p)){
        var s = fs.statSync(p);
        if (s.isFile()) return true;
    }
    return false;
};
Grackle.prototype.error_exit = function(errors){
    console.log (this.error_art);
    _.each(errors, function(e){
        console.log(e);
    });
    console.log(this.help);
    process.exit(1);
};
Grackle.prototype.stripTrailingSlash = function(str) {
    if(str.substr(-1) == '/') {
        return str.substr(0, str.length - 1);
    }
    return str;
};

new Grackle();
