# hicaro

My personal website built with its own static website generator.

I wrote my own static website generator for building this website without using
front-end frameworks, such as React, Angular or VueJS, for example.

## Requirements

For installing all packages,

```bash
yarn install
```

And, for testing locally,

```bash
yarn global add http-server
```

See [Yarn docs for global configurations](https://classic.yarnpkg.com/lang/en/docs/cli/global/);

## Build

For local testing:

```bash
yarn serve
```

This command above will generate a `_public` directory containing all the
statically generated files for testing purposes and, after generating all the
static files, it will spawn a local server in the port `:8080`. Access
`localhost:8080` on your browser.

For a debug build:

```bash
yarn build:local
```

This command above will generate a `_public` directory containing all the
statically generated files. If you don't want to generate the `public` directory
and wants to see the result before, you should use this command.

For a production build:

```bash
yarn build:prod
```

This command above will generate a `public` directory containing all the
statically generated files. After that, CI will do the rest of the work by
uploading artifacts to GitHub Pages.

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE).
