# Clicker

<img width="1081" height="935" alt="image" src="https://github.com/user-attachments/assets/dea7d604-159b-4d13-9b4e-dcb4b5b4e2e1" />


This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.16.

## Authentication

Sign-up and sign-in are fully playable in the deployed build with no server
running. `AuthService` talks to an `AuthBackend`, and which implementation it
gets is decided by `environment.useRemoteAuth`:

- **`false` (default)** — `LocalAuthBackend`. Accounts live in `localStorage`,
  the issued token is an opaque placeholder, and the session survives a reload.
  **Passwords are stored in plain text and nothing is hashed.** That is a
  deliberate choice for a browser-only demo with nothing to protect; it is not a
  pattern to copy, and it is not a security boundary.
- **`true`** — `RemoteAuthBackend`, which posts to `POST /auth/register` and
  `POST /auth/login` at `environment.apiUrl` through `ApiService`. The access
  token is attached by `AuthInterceptor`. Set `apiUrl` to a running API and flip
  the flag; nothing else in the app changes.

`environment.prod.ts` is wired up through `fileReplacements` in `angular.json`,
so production builds really do use it.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
