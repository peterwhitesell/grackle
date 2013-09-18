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

    this.sources = require(this.paths.sources);
    for(var pairName in this.sources){
        this.busy[pairName] = false;
        this.sources[pairName] = this.validatePair(pairName, this.sources[pairName]);
        this.watching[pairName] = this.watchPair(pairName, this.sources[pairName]);
    }
}

Grackle.prototype.validatePair = function(pairName, pair){
    console.log("Validating " + pairName);
    if (! this.fileExists(pair.watch)){
        this.error_exit([
            'Specify a file for me to watch.'
            , 'Watch: ' + pair.watch
        ]);
    }
    pair.watch = path.resolve(pair.watch);
    if (! this.dirExists(pair.source)){
        this.error_exit([
            'Specify a single source directory for me to copy from.'
            , 'Source: ' + pair.source
        ]);
    }
    pair.source = this.stripTrailingSlash(pair.source);
    pair.source = path.resolve(pair.source);

    if ('' != path.extname(pair.target)){
        //then we're dealing with a file path...
        if (! this.dirExists(pair.target)){
            var d = path.dirname(pair.target);
            if (! this.dirExists(d)){
                this.error_exit([
                    'The directory doesn\'t exist for me to copy into.'
                    , 'Target: ' + pair.target
                ]);
            }
        }

    } else {
        //we're dealing with a directory path
        if (! this.dirExists(pair.target)){
            this.error_exit([
                'Specify a directory for me to copy into.'
                , 'Target: ' + pair.target
            ]);
        } else {
        }
    }
    pair.target = path.resolve(pair.target);
    return pair;
};


Grackle.prototype.watchPair = function(pairName, pair){
    this.isWatching(pairName, pair);
    var that = this;
    return fs.watch(
        pair.watch, function(event, filename){
            if(!that.busy[pairName]){
                that.start[pairName] = new Date();
                that.busy[pairName] = true;
                console.log('');
                console.log(filename, event + 'd');
                console.log("Starting to copy " + pairName);
                console.log('Copying to ' + pair.target + '. . .');

                var exclude = "";
                if(pair.exclude){
                    exclude = "--exclude-from " + pair.exclude + " --delete-excluded ";
                }

                cmd = "rsync -av --delete " + exclude + pair.source + ' ' + pair.target;
                exec(
                    cmd,
                    function(error, stdout, stderr){
                        that.busy[pairName] = false;
                        that.watchCallback(pairName, error, stdout, stderr);
                    }
                );

            }
        }
    );
};


Grackle.prototype.isWatching = function(pairName, pair){
    console.log('');
//    console.log(this.art);
    console.log('Watching ' + pairName + '...');
    console.log('Watch:          ' + pair.watch);
    console.log('Source:         ' + pair.source);
    console.log('Target:         ' + pair.target);
    if(pair.exclude){

        console.log('Exclude:        ' + pair.exclude);
    }
    console.log('')
};
Grackle.prototype.watchCallback = function (pairName, error, stdout, stderr) {
    if (error !== null) {
        console.log (this.error_art);
        console.log(error.message);
    } else {
        var d = new Date();
        var elapsed = (d.getTime() - this.start[pairName].getTime())/1000;
        console.log('Copied ' + pairName + ' in '+ elapsed + ' seconds.')
    }
    this.watching[pairName].close();
    this.watchPair(pairName, this.sources[pairName]);
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
