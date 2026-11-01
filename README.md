# Handy Game Chat

**Voice-to-chat for World of Warcraft (and other games): hold a button, say your message, release, and it's in chat.**

Handy Game Chat is a fork of [Handy](https://github.com/cjpais/Handy), a free, open-source speech-to-text app that runs **entirely on your own computer**. No audio is sent to the cloud. This version adds options built for in-game chat, so you can keep running, jumping, casting and PvPing while you talk.

### ⬇️ [Download the latest release](https://github.com/babyjay3000/Handy/releases/latest)

> Windows only for now. The installer isn't code-signed, so Windows SmartScreen will warn you. Click **More info → Run anyway**.

---

## Why I made this

I recently began using an **Azeron Cyborg 2** so I'd have over 100 keybinds within easy reach: all the spells, items, equipment and macros you need to be at your best in Classic WoW. One thing I still wanted to improve was chatting in game while playing, which got even harder once my hand stayed on the Cyborg full time instead of my keyboard.

[This video](https://youtu.be/8Iag9ND7biE) introduced me to Handy. It worked incredibly well in game, but it wasn't quite as good as it could be. I wanted to **hold a button while doing whatever I'm doing, and the moment I release it, have my message go straight into WoW chat.** So I added that.

## What it adds

All new options are in **Settings → Advanced → Output**.

| Option | What it does |
|---|---|
| **Open Input Field** | Presses the key that opens chat in WoW (e.g. `Enter`) right before your message is typed. |
| **Input Field Delay** | Defaults to **0 ms**. Add a little delay if messages get submitted too quickly. |
| **Clear Field Before Pasting** | A must-have. Stray keys, like your movement keys, can slip into the message you're sending. This uses **Shift+Home** to select them so your message replaces them. (Not Ctrl+A, because that would interfere with most players' movement.) Since adding this, I haven't gotten a single unwanted keypress in my testing. |
| **Slash Command Shortcut** | A second keybind that opens chat with `/`. Hold it and say "dance" or "train". Say "yell hello world" to get `/yell hello world`. Channel commands like yell, say, party and raid are handled cleanly, and spoken numbers become channel numbers ("two LFG tank" → `/2 lfg tank`). |
| **Slash Command Numbers as Digits** | Turns a spoken number at the start of a slash command into digits, for `/1`, `/2` and so on. On by default. |
| **Auto-Capitalization** | Turn off the automatic capitals if you like. Role-players may want to keep them; I think chat looks more natural and casual without them. |

You don't even need the second shortcut: with the main keybind, just say **"slash yell hello world."**

## Setup

1. Download and run the installer from the [Releases page](https://github.com/babyjay3000/Handy/releases/latest).
2. Follow Handy's first-time setup, which downloads a speech model.
3. In **Settings → Advanced**:
   - Turn on **Open Input Field** (key: **Enter**) and **Clear Field Before Pasting**.
   - Set **Auto Submit** to **Enter**.
   - Turn **off** "Check for updates". The updater points to the official Handy and would replace this version.
4. Set your **Transcribe** shortcut (and the **Slash Command** shortcut, if you want it) to keys or buttons you can hold comfortably while playing.

**Recommended settings:**

![Recommended settings](docs/recommended-settings.png)

It runs in the background, can launch automatically at startup, and has an optional floating widget so you can watch your voice being recorded, or hide it so it becomes a seamless part of your gameplay. It takes about 1–2 seconds to transcribe what you say and put it in game.

## Tip: scroll-wheel tilt

If your mouse has scroll-wheel tilt, try assigning **left tilt** to open chat and **right tilt** to slash chat, and make them your **hold** keybinds in Handy's General settings, so you hold the wheel tilted to record. It was one of the few inputs I had left while getting ready for WoW Forever, and I think I found the perfect use for it.

## Why try it

Just running around Elwynn testing it has been a blast. I'm saying funny one-liners to the Kobolds I kill, and striking up random conversations with other levelers has led to interesting and humorous interactions.

Even though I mentioned my Azeron Cyborg first, this has huge potential however you play: on a keyboard, even as a fast typist, on a gamepad from the couch, or as an accessibility tool for disabled players. It should make typing in chat about **3 times faster and 10 times easier**. I'm disappointed something like this doesn't exist in WoW by default, because it can make the game more fun and more social.

## Disclaimers

- **This program may be considered a violation of Blizzard's Terms of Service.** Will you get banned for using it? I highly doubt it, but **use at your own risk.**
- **I 100% used Claude to help code this project.** I'm not a developer and wouldn't have figured it out on my own. The words here and the vision for the project are my own.

## Credits and license

Built on [Handy](https://github.com/cjpais/Handy) by CJ Pais and its contributors. All of Handy's original features are still here; see the [original README](https://github.com/cjpais/Handy#readme) for full documentation.

Licensed under the [MIT License](LICENSE), the same as Handy.
