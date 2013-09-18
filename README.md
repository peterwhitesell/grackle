mockingbird
===========

Mockingbird is a recursive directory synchronization tool that watches a file and triggers when it changes.
## usage

```
./mockingbird path/to/pairs.json
```

pairs.json should look like this with as many entries as you'd like:

```
{
    "test1": {
        "exclude": "/home/peter/webdev/mockingbird/tests/exclude_git",
        "watch"  : "/home/peter/webdev/mockingbird/tests/watch",
        "source" : "/home/peter/webdev/mockingbird/tests/test_dir/",
        "target" : "/home/peter/webdev/mockingbird/tests/test_dest/"
    },
    "test2": {
        "watch" : "/home/peter/webdev/mockingbird/index.js",
        "source": "/home/peter/webdev/mockingbird/tests/test_dir/test_inner_dir/",
        "target": "/home/peter/webdev/mockingbird/tests/test_dest/"
    }
}
```

For each entry:
```exclude``` is an optional file that lists patterns to exclude in the synchronization.
```watch``` is the file Mockingbird watches. When that file changes, Mockingbird uses ```rsync``` to copy ```source``` into ```target```.

For instance, if you have ```path/to/a``` and ```path/to/b``` and you want to have ```path/to/b/a```,
you should have
```
{
    ...: {
        ...
        "source": "path/to/a",
        "target": "path/to/b"
    },
    ...
}
```