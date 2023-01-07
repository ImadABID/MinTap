# MinTap

## Repository organization :

| Directory   |      Content      |
|----------|:-------------:|
| TAP |    A TAP server mimicking real TAPs like IFTTT.   |
| Rule transformer |    A JavaScript code capable of transforming a rule to an axillary rule used by the service filter to filter out unnecessary values from the TAP response.   |
| Chrome extension | A chrome extension that transforms the rule using the rule transformer code before sending it to the TAP server so that the user experience won't change compared to a typical TAP. |
| Debug GUI |  A global user interface for debug (ex : showing that the service filter rejects some fields …). |

## Project dependencies :

### MongoDB :

Installation :

* Debian/Ubuntu : [Visit the doc](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/).

* Fedora : [Visit the doc](https://developer.fedoraproject.org/tech/database/mongodb/about.html).

Start mongodb demon :

    sudo systemctl start mongod.service

Test the installation :

    mongod --version


## Port reservations :

| Server | Port |
|-----|-----|
|MongoDB|27017|
