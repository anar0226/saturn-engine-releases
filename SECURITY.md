# Reporting a security problem

**Please do not open a public issue for a vulnerability.** A public report tells
everyone, including whoever would use it, before there is a fix to install.

Report it privately through GitHub Security Advisories on the releases repo:

https://github.com/anar0226/saturn-engine-releases/security/advisories/new

That reaches the maintainer directly and stays private until a fix ships.

## What to include

Whatever you have. A rough report beats a silent one.

- What you found, and what it lets someone do.
- How to reproduce it. A sample project, a prompt, or a file is ideal.
- The Saturn Engine version (Help → About, or the installer filename).
- Your Windows version.

## What to expect

This is a beta shipped by one person, so honest numbers rather than an SLA:

| | |
|---|---|
| First reply | within 7 days |
| Assessment of severity | within 14 days |
| Fix, for something being actively exploited | as fast as a release can be cut |

You will be credited in the release notes unless you would rather not be.

## What is in scope

The Saturn Engine editor and installer, the bundled Godot runtime as Saturn
configures and launches it, the code generation path, and anything Saturn writes
into an exported game.

**Particularly worth reporting:**

- Anything that gets code executed outside the runtime's confinement. The game
  process is deliberately confined (a Job Object on Windows); a way out of that
  is a real finding.
- A prompt or project file that makes the editor write or run code the user did
  not ask for.
- Anything that reads or sends a user's files, projects, or API keys off the
  machine.

## What is not

- **Windows SmartScreen warning about an unknown publisher.** Known and
  disclosed: the build is not code-signed yet. It is on the roadmap, and the site
  says so plainly rather than hiding it.
- Vulnerabilities in Godot Engine itself. Report those to the Godot project,
  which can fix them at the source: https://github.com/godotengine/godot/security
- Anything requiring an attacker to already have administrator access to the
  machine.
