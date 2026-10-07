# Tiny Lab (iOS)

A personal iOS app for logging whether I ran each experiment today. It's
inspired by *Tiny Experiments* by Anne-Laure Le Cunff. It works fully offline
and can optionally sync through iCloud.

SwiftUI + SwiftData · iOS 17+ · no third-party dependencies · no server.

## Run it on your iPhone

1. You need a Mac with **Xcode 16 or newer**. A free Apple ID is enough.
2. Open `ios/TinyLab/TinyLab.xcodeproj`.
3. Select the **TinyLab** target → *Signing & Capabilities* → pick your
   **Team** (your Apple ID). If Xcode says the bundle ID is taken, change
   `com.shreyjariwala.tinylab` to something unique.
4. Plug in your iPhone (or pick a simulator) and press **⌘R**.
   - On a real device the first time: iPhone *Settings → General → VPN &
     Device Management* → trust your developer certificate. Turn on
     *Developer Mode* if iOS asks.
   - With a free Apple ID the app must be re-signed every 7 days (just run it
     from Xcode again). A paid developer account removes that limit.

No internet is needed at any point after install.

## Sync options (both optional)

| Option | Needs | How |
| --- | --- | --- |
| **Backup file** | nothing | Settings → *Export backup (JSON)* → save to iCloud Drive / Files / AirDrop. *Import* merges and skips duplicates. |
| **iCloud sync** | paid Apple Developer account | Xcode → target → *Signing & Capabilities* → **+ Capability** → **iCloud** → tick **CloudKit** → add container `iCloud.<your bundle id>`. Also add **Background Modes** → tick **Remote notifications**. Rebuild. In the app: Settings → turn on **iCloud sync** → quit and reopen. |

The data always lives on the device first. With iCloud on, SwiftData mirrors
it to your *private* iCloud database, so a second device signed into the same
Apple ID gets the same data. If the capability is missing, the app quietly
stays local.

## How the book maps to the app

| Book idea | In Tiny Lab |
| --- | --- |
| **Pact**: "I will [action] for [duration]" | New pact screen is literally that sentence plus a duration. |
| **PACT**: Purposeful, Actionable, Continuous, Trackable | Curiosity *question* field (Purposeful), a concrete action, a set number of days, a daily did/didn't log plus an optional number. The editor shows a live PACT check. |
| Success = running the pact, not the outcome | The main number is the hit rate (days done ÷ days due). There are no targets. |
| **Growth loops** (act → reflect → adjust) | Log daily → review → persist / pause / pivot → next pact. |
| **Triple Check** (Head / Heart / Hand) | When you tap the cross, it asks *what got in the way?* The detail screen totals the reasons and suggests a fix. |
| **Field notes** | A note (and value) on any day. Long-press a day in the grid, or the row on Today. |
| **Plus / Minus / Next** | Three-line review on every pact. *Next* pre-fills the question when you pivot. |
| **Persist / Pause / Pivot** | Decision buttons. Persist adds days, Pause stops the pact, Pivot closes it and opens a pre-filled new pact linked to the old one. |
| Cognitive scripts (Sequel, Crowd-pleaser, Epic) | Explained in the in-app *Field guide*, as a check on why you picked an experiment. |

What I added beyond the book:

- **Outputs**: log what an experiment produced (insight, artifact, data,
  link). Each output has an *Operationalized* toggle for when it's put to work.
- **Operationalize → Practice**: a pact that earns its place becomes a
  *practice*. It gets a routine and has no end date. You keep logging it daily
  on the Today screen.
- **Capabilities** (development programs): practices and experiments roll up
  into a capability with a level (Exploring → Practicing → Proficient →
  Teaching), a *why*, a *what good looks like*, and evidence (experiments,
  practices, reps, outputs in use). From a capability you can start a new
  experiment aimed at it.
- **Question to capability**: each capability records the question that started
  it and when you first asked it. It also records the date of each milestone:
  first experiment, first proof, and each level reached. The capability screen
  shows how many days it took you to absorb the topic. The web demo draws this
  as a bridge from the question to the capability.

```
experiment (pact) ──review──▶ persist / pause / pivot
        │                                   │
        └──operationalize──▶ practice ──▶ capability program
                  outputs ──operationalized──┘
```

## Screens

- **Today**: every running experiment and practice, each with check and cross
  buttons. Tap again to undo. A progress bar shows how many you've logged
  today. Pacts that have ended show up at the top, waiting for a decision.
- **Lab**: every pact, with filters, plus totals (reps, hit rate, outputs).
- **Pact detail**: stats (done, hit rate, streak, best streak, metric total),
  a tappable day grid (done → missed → clear), Triple Check totals, outputs,
  review, and operationalize.
- **Capabilities**: your development programs.
- **Settings**: a daily local reminder, iCloud sync, JSON backup, and the field
  guide.

## Code layout

```
TinyLab/
  TinyLabApp.swift        app entry, local vs iCloud ModelContainer, tabs
  Models/Models.swift     Pact, CheckIn, LabOutput, Capability (+ stats)
  Models/PactActions.swift log / cycle / persist / pause / pivot / operationalize
  Services/Backup.swift   JSON export/import
  Services/Reminder.swift daily local notification
  Views/                  one file per screen
design/                   custom icon set + motion plan (see design/README.md)
demo/                     clickable web demo of the app
```

The project uses Xcode 16's synchronized folders, so any `.swift` file you add
under `TinyLab/` is built automatically. All model properties have defaults
and all relationships are optional, which is what CloudKit sync requires.
