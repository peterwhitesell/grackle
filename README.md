mockingbird
===========

Mockingbird is a recursive directory synchronization tool that watches a file and triggers when it changes.

## usage

```
./mockingbird path/to/pairs.json
```

pairs.json should look like this:

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
    },
    "RealtimeMarketingLab": {
        "exclude": "/home/peter/webdev/mockingbird/tests/exclude_git",
        "watch"  : "/home/peter/webdev/rltm/wp-content/themes/.git/COMMIT_EDITMSG",
        "source" : "/home/peter/webdev/rltm/wp-content/themes/RealtimeMarketingLab/",
        "target" : "/home/peter/webdev/rltm_deploy/wp-content/themes/"
    },
    "mmep": {
        "exclude": "/home/peter/webdev/mockingbird/tests/exclude_git",
        "watch"  : "/home/peter/webdev/rltm/wp-content/mu-plugins/mmep/.git/COMMIT_EDITMSG",
        "source" : "/home/peter/webdev/rltm/wp-content/mu-plugins/mmep/",
        "target" : "/home/peter/webdev/rltm_deploy/wp-content/mu-plugins/"
    }
}
```