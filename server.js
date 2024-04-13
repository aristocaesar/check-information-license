const { App } = require("./src/app");

App.listen(process.env.SERVER_PORT, (error) => {
  if (error) {
    console.log(error);
    return;
  }
  console.log("Server running on port :", process.env.SERVER_PORT);
});
