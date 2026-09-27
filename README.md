# killp

Kill processes listening on one or more TCP ports.

```sh
npx killp 3000
npx killp 3000 8080
```

Or install the command globally:

```sh
npm install -g killp
killp 3000
```

Supports macOS and Linux. Requires `/bin/sh`, `lsof`, `xargs`, `kill`, and `tr`
on your system. There are no npm dependencies. Windows is not supported.

This command immediately sends **SIGKILL** to every process listening on the
specified TCP ports, without confirmation or graceful shutdown. Only use it on
processes you intend to force-stop. Your user must have permission to stop them.

With no arguments, it prints usage and exits with status 2. Nonnumeric arguments
are rejected. Port ranges are not validated, and an `lsof` error can be reported
as “nothing listening.”

## Development

The executable is the standalone POSIX shell script [`killp`](killp). It can also
be run directly as `./killp PORT [PORT ...]` without Node.js.

Run `npm test` to check the package contents, command usage, invalid input, and
termination of a disposable listener through `npx`. The tests use Node.js 24+.
Run `npm publish ./killp-VERSION.tgz` to publish the tested tarball.

## License

[MIT](LICENSE), starting with version 0.1.1. Version 0.1.0 was published under ISC.
