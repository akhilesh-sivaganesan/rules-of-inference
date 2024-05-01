# Rules of Inference Problem Generator
The aim of this project is to randomly generate rules of inference problems to enable students in CS 2050 or an equivalent class to gain
better understanding of the principles behind solving such problems. Given that such problems are hard to grasp and are hard to create,
this problem generator will aim to help with both of these issues. Since the problems are randomly generated, there should theoretically be
infinite number of possible questions to solve, which can save an instructor's time of trying to create such a problem as well as allow a
student to practice to their heart's content.

## Release Notes
### Version 1.0.0
#### New Features
* Added De Morgan's as a possible problem type
* Created a new statistics page that tracks and displays user stats
#### Bug Fixes
* Rewrote a large portion of problem generating code to fix known errors
* Fixed letter buttons on problem page to display correct letters


### Version 0.4.0

#### New Features
* Frontend and backend changes for medium problem generation, incorporating a separate Lambda
* UI/UX updates for the landing page, problem generation, and solution pages
* Export problems and solutions to LaTeX for easy test/problem set generation
* Built in modal for rules of inference reference
#### Bug Fixes
* Fixed nested parenthesis in problem generation to correctly account for logical equivalences


### Version 0.3.0

#### New Features
* Frontend and backend changes for letter agnostic solution checking
* Generate problems in website using multiple letters, besides previously constraining variables P, Q, R
* Checking steps interpret student solution based on structure of premises instead of hard-coded match
* Improved flexibility as students can input spaces in responses in some areas
#### Bug Fixes
* Fixed AWS Lambda to use correct disjunctive symbol


### Version 0.2.0

#### New Features
* We set up problem generation, with trials in multiple languages/formats
* We implemented two difficulty levels of problems: easy and medium
* We allowed users to cycle through problems, and continuously generate them
#### Bug Fixes
* Fixed AWS Lambda default values of problem generation fields
* Correctly displayed newly generated problems with all symbols parsed correctly
### Version 0.1.0

#### New Features
* We set up a basic AWS Lambda function and connected it to the frontend. It currently returns a set of hardcoded problems, which sprint will be replaced with an algorithm.
* We created a basic solution checker as well, which will get replaced in sprint 3.
* We created the majority of the pages and layouts as well to prepare for future development.
#### Bug Fixes
* N/A

---
## User Guide
You may access the website here or you may download from the GitHub repo and run the website using the instructions below.

#### Installation Steps
* Install Node.js and npm (https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
* Clone our repo here into a new folder
* Run *npm install*
* Run *npm run dev*
* If you run into any errors you should try to delete the node_modules folder and rerun the command

## Dev Guide
The frontend code lives on GitHub and is hosted using AWS Amplify. 

The backend code uses AWS Lambda and AWS API Gateway.

New accounts have been created for Google, GitHub, and AWS to hand over full access over. Use the logins provided to edit any code.
