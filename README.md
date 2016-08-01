In order to run, we need to be running a server since we are using 'cross-origin' data with the json files

Easiest way to do this is to:

1. Install Node.js (https://nodejs.org/en/) - LTS version is good
2. Once installed, type `npm -version` in terminal/cmd to make sure it installed correctly
3. Now run `npm install http-server -g` - This will install files needed to run http-server
2. Clone this repository and run `http-server` from the home directory - This will create the server
3. Visit localhost:8080


To compile/run the java code, cd into java folder and run:

`javac Runner.java` - to compile

`java Runner` - to run

This will read in raw.data and create output.json. I then run output.json through a formatter (https://jsonformatter.curiousconcept.com/) and then paste that as my data.json file.

All the code for the graph is in script.js
