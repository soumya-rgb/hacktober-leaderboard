This project redirects the users to the leaderboard website after authenticating through Github and view a live leaderboard of all the participants.
Each participant's score is determined by their total pull requests made to repositories tagged with hacktoberfest.

To run the project locally, install Node.js and clone the repo and follow the given steps:
1. Open cmd and go to the folder where you have cloned this repo.
2. Write the command npm init -y , this creates the package.json file.
3. npm install express axios cors,  installs the dependencies.
4. Now run, node server.js.
5. Open your browser and go to http://localhost:3000 .
6. To test for user registration give http://localhost:3000/register?username=<enter your github username> . 
