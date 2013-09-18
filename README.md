grackle
===========

Grackle is a recursive directory synchronization tool that watches a file and triggers when it changes.
## usage

```
git clone https://github.com/peterwhitesell/grackle.git
cd grackle
chmod +x grackle
./grackle /absolute/path/to/pairs.json
```

pairs.json should look like this with as many entries as you'd like:

```
{
    "test1": {
        "exclude": "/home/peter/webdev/grackle/tests/exclude_git",
        "watch"  : "/home/peter/webdev/grackle/tests/watch",
        "source" : "/home/peter/webdev/grackle/tests/test_dir/",
        "target" : "/home/peter/webdev/grackle/tests/test_dest/"
    },
    "test2": {
        "watch" : "/home/peter/webdev/grackle/index.js",
        "source": "/home/peter/webdev/grackle/tests/test_dir/test_inner_dir/",
        "target": "/home/peter/webdev/grackle/tests/test_dest/"
    }
}
```

For each entry, ```exclude``` is an optional file that lists patterns to exclude in the synchronization. ```watch``` is the file Grackle watches. When that file changes, Grackle uses ```rsync``` to copy ```source``` into ```target```.

For instance, if you have ```path/to/a``` and ```path/to/b/``` and you want to have ```path/to/b/a/```, pairs.json should include:

```
{
    ...: {
        ...
        "source": "path/to/a/",
        "target": "path/to/b/"
    },
    ...
}
```

Grackle overwrites any conflicting files in the ```target```. It also deletes any files previously in ```target``` that are not in ```source``` and any files matchced in ```exclude```.