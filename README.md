# Set up guide
## Installing bun
We will be using `bun` as our package manager (if you're used to `npm` it's that on crack).

If `bun` is not installed/haven't used it before:

### MacOS & Linux
```
curl -fsSL https://bun.sh/install | bash
```

### Windows
```
powershell -c "irm bun.sh/install.ps1 | iex"
```

## Booting up the server
```
bun install
bun run dev
```

Once server is running, visit http://localhost:5173.
