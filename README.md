# Hermes

A tool for dispatching pre-arranged payload so you can replay emails.
You can then save these requests into namespaces and projects and use them over and over again. 
Easily editable and configured for hosting to firebase. 

Note that this project was created as the UI for [Strigoaica](https://github.com/stefanoschrs/strigoaica) which is a project agnostic service for template based notification delivery. It can also work with any other system given that all requests go to a single endpoint.

![screenshot](https://www.imageupload.co.uk/images/2018/06/08/ScreenShot2018-06-08at6.00.09PM.png)

### Setup

Go to `firebase.google.com` and create a project.

Get into the `project settings` and click `Add firebase to your web app`

`Replace` the content of the `config` object into `src/firebaseConfig.js`.

You now need to create a `firestore` database by clicking on `Database` from side nav and click `Create database` where it says Cloud firestore.

When you are asked for `locked mode` or `test mode` choose **test mode**.

Run `npm start` to start the project.

