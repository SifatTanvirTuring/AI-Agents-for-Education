This project is a React application built with Vite that serves as a learning companion. The initial state of this project is healthy and should build successfully.

User's Task

The user wants to modify the application with the following requests:

The dashboard currently displays the user's email. It should be updated to display the user's name, which is provided during the onboarding quiz.

The name provided during onboarding is not being saved correctly to the database. This needs to be fixed.

A new input field should be added to the onboarding quiz's welcome step to ask for the student's next exam date in dd/mm/yy format.

Evaluation

To evaluate a new model's performance on this task, follow these steps:

Build and Run the Initial State:
Run docker-compose up --build. The build should complete successfully, indicating the project's initial healthy state.

Access the Container:
Once the container is running, get a shell inside it:

```sh
docker exec -it eval-app /bin/sh
```

Apply Changes:
Inside the container, apply the necessary code modifications to address the user's requests.

Verify the Fix:
After applying changes, re-run the build command to ensure the project still builds without errors:

npm run build


To test the application's functionality, start the development server with npm run dev and access it in a browser.