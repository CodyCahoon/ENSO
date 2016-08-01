In order to run you need to be running a server since we are using 'cross-origin' data with the json files

Easiest way to do this is to:
1. Install Node.js
2. Clone this repository and run http-server
3. Visit localhost:8080

To run the java code:
`javac Runner.java`
`java Runner`

This will read in raw.data and create output.json. I then run output.json through a formatter (https://jsonformatter.curiousconcept.com/) and then paste that as my data.json file.

All the code for the graph is in script.js
