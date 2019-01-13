# Tabellarius

A tool for dispatching pre-arranged payload so you can replay emails.
You can then save these requests into namespaces and projects and use them over and over again. 
Easily editable and configured for hosting to firebase. 

Note that this project was created as the UI for [Strigoaica](https://github.com/stefanoschrs/strigoaica) which is a project agnostic service for template based notification delivery. It can also work with any other system given that all requests go to a single endpoint.

![Imgur](https://i.imgur.com/suHXocE.png)

### Firestore Setup
![Firestore Setup](https://i.imgur.com/YEPxEZJ.gif)
1. Create a project at [https://console.firebase.google.com](https://console.firebase.google.com)
1. Click on **Add firebase to your web app** and copy the **config** object to `src/firebaseConfig.js`
1. Create a **Firestore** database (If you select test mode skip the next steps)
1. Go to the **Rules** section and remove the `: if false` to hacky allow remote connections

### Run
`npm start`

