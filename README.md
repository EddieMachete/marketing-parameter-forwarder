# marketing-parameter-forwarder
Proof of concept for library that can store parameters (like UTM) in a cookie and add them to a specific link when a page loads.

## Developing in VS Code inside a Docker container

### Pre-requisites

* Have Docker installed on the computer
* Have the `Microsoft` [Remote - Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers&ssr=false#review-details) installed in `VS Code`

### Instructions

Use the `Remote - Containers` extension to clone the repository in a container volume.
You can do this directly from `GitHub` or from a local folder after cloning the project.
Once `VS Code` opens the repository from the container, run the following commands:

`npm install` to install all dependencies
`npm start` to view demo at location http://localhost:44333/?utm_source=google&utm_medium=cpc&utm_campaign=spring_sale&utm_term=running_shoes&utm_content=textlink
`npm run test` to execute the unit and integration tests
