# Making one game together

Two people (or more) can work on one Saturn game by sharing it as a folder
through GitHub. Saturn writes the game as plain files; GitHub keeps everyone's
copy in step and keeps every version.

## What's in the folder

| File | What it is |
|---|---|
| `saturn.json` | the game's name, the engine it was made with, the order of its scripts |
| `game/<name>.gd` | each script of the game, one file each |
| `scene.json` | the visual scene (when the game has one) |
| `assets/` | the models, pictures and sounds you imported that the game uses |

## Set it up once (about 10 minutes)

**The person who has the game:**

1. Install **GitHub Desktop** (desktop.github.com) and sign in to GitHub.
2. In Saturn, open the game, then **File → Choose Shared Folder…** and pick an
   empty folder (e.g. `Documents\my-game`). Saturn writes the game into it.
3. In GitHub Desktop: **File → Add local repository…**, pick that folder, and
   when it offers, **create a repository** there. Then **Publish repository**,
   and keep **"Keep this code private"** ticked.
4. On github.com, open the repository → **Settings → Collaborators → Add
   people**, and invite your friend.

**Your friend:**

1. Accepts the invite (an email from GitHub), installs **GitHub Desktop**,
   signs in, and **Clones** the repository (File → Clone repository).
2. In Saturn: **File → New Project**, open it in Studio, then **File → Load
   from Shared Folder** and pick the cloned folder. The game opens in that
   project, which is now their copy.

## Every day

| When | You do |
|---|---|
| Before you start | GitHub Desktop: **Fetch / Pull**. Saturn: **File → Load from Shared Folder**. |
| When something works | Saturn: **File → Save to Shared Folder**. GitHub Desktop: write one line about what you did, **Commit**, then **Push**. |

Saturn remembers the folder for each project, so after the first time, Save and
Load don't ask.

## The one rule: one owner per file

Agree who owns which files (for example: you own `game/levels.gd` and
`scene.json`, your friend owns `game/story.gd` and `game/data_enemies.gd`).
Two people changing **different** files merge on their own. Two people
changing the **same** file at the same time get a "conflict" in GitHub
Desktop, and one of you has to pick which change to keep.

The visual scene is one file (`scene.json`), so only one person edits the
scene at a time.

## If something goes wrong

- **Load says the folder's game did not pass the safety gate:** the newest
  push has a broken script. Saturn changed nothing. Fix that file (or ask who
  changed it), save, push, and load again.
- **A conflict in GitHub Desktop:** open the file it names, keep the right
  part, save, commit. Your own Saturn project still has every older build in
  **Edit → Version History**.
- **A model shows as missing:** whoever imported it saves to the shared folder
  again; Saturn copies the game's imported files into `assets/`.

A teammate's scripts are checked like the AI's: a script marked
`# saturn:unsafe` (one that may use the operating system) does not load from a
shared folder.
