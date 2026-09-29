import SwiftData
import SwiftUI

struct SettingsView: View {
    @Environment(\.modelContext) private var context
    @AppStorage(SettingsKey.iCloudSync) private var iCloudSync = false
    @AppStorage(SettingsKey.reminderOn) private var reminderOn = false
    @AppStorage(SettingsKey.reminderMinutes) private var reminderMinutes = 21 * 60

    @State private var launchedWithSync = UserDefaults.standard.bool(forKey: SettingsKey.iCloudSync)
    @State private var exportDoc: BackupDocument?
    @State private var showingExporter = false
    @State private var showingImporter = false
    @State private var message: String?

    private var iCloudSignedIn: Bool { FileManager.default.ubiquityIdentityToken != nil }

    private var reminderTime: Binding<Date> {
        Binding {
            Calendar.current.date(bySettingHour: reminderMinutes / 60, minute: reminderMinutes % 60,
                                  second: 0, of: .now) ?? .now
        } set: { date in
            let c = Calendar.current.dateComponents([.hour, .minute], from: date)
            reminderMinutes = (c.hour ?? 21) * 60 + (c.minute ?? 0)
        }
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Toggle("Daily nudge", isOn: $reminderOn)
                    if reminderOn {
                        DatePicker("Time", selection: reminderTime, displayedComponents: .hourAndMinute)
                    }
                } header: {
                    Text("Reminder")
                } footer: {
                    Text("A local notification — no internet needed.")
                }

                Section {
                    Toggle("iCloud sync", isOn: $iCloudSync)
                    LabeledContent("iCloud account", value: iCloudSignedIn ? "Signed in" : "Not signed in")
                    if iCloudSync != launchedWithSync {
                        Label("Quit and reopen the app to apply.", systemImage: "arrow.clockwise")
                            .foregroundStyle(.orange)
                    }
                } header: {
                    Text("Cloud sync (optional)")
                } footer: {
                    Text("Off: everything stays on this iPhone. On: SwiftData mirrors your data to your private iCloud database. Requires the iCloud capability in Xcode — see the README.")
                }

                Section {
                    Button("Export backup (JSON)", systemImage: "square.and.arrow.up") { export() }
                    Button("Import backup", systemImage: "square.and.arrow.down") { showingImporter = true }
                } header: {
                    Text("Backup")
                } footer: {
                    Text("Save to Files / iCloud Drive / AirDrop. Import merges and skips anything already here.")
                }

                Section {
                    NavigationLink {
                        FieldGuideView()
                    } label: {
                        Label("Field guide", systemImage: "book")
                    }
                } footer: {
                    Text("Tiny Lab — inspired by Tiny Experiments by Anne-Laure Le Cunff.")
                }
            }
            .navigationTitle("Settings")
            .onChange(of: reminderOn) { _, on in
                if on { reschedule() } else { Reminder.cancel() }
            }
            .onChange(of: reminderMinutes) { _, _ in
                if reminderOn { reschedule() }
            }
            .fileExporter(isPresented: $showingExporter, document: exportDoc, contentType: .json,
                          defaultFilename: "TinyLab-\(Date.now.formatted(.iso8601.year().month().day()))") { result in
                if case .failure(let error) = result { message = error.localizedDescription }
            }
            .fileImporter(isPresented: $showingImporter, allowedContentTypes: [.json]) { result in
                importBackup(result)
            }
            .alert("Tiny Lab", isPresented: Binding(get: { message != nil }, set: { if !$0 { message = nil } })) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(message ?? "")
            }
        }
    }

    private func reschedule() {
        let minutes = reminderMinutes
        Task {
            let ok = await Reminder.schedule(minutesAfterMidnight: minutes)
            if !ok {
                reminderOn = false
                message = "Notifications are off for Tiny Lab. Enable them in iOS Settings."
            }
        }
    }

    private func export() {
        do {
            try context.save()
            let data = try BackupService.export(from: context)
            exportDoc = BackupDocument(data: data)
            showingExporter = true
        } catch {
            message = "Export failed: \(error.localizedDescription)"
        }
    }

    private func importBackup(_ result: Result<URL, Error>) {
        switch result {
        case .success(let url):
            let scoped = url.startAccessingSecurityScopedResource()
            defer { if scoped { url.stopAccessingSecurityScopedResource() } }
            do {
                let data = try Data(contentsOf: url)
                let added = try BackupService.importData(data, into: context)
                message = "Imported \(added.pacts) pacts and \(added.capabilities) capabilities."
            } catch {
                message = "Import failed: \(error.localizedDescription)"
            }
        case .failure(let error):
            message = error.localizedDescription
        }
    }
}

/// Pocket version of the book's tools, in my own words.
struct FieldGuideView: View {
    private let entries: [(String, String, String)] = [
        ("flask", "Pact",
         "\"I will [action] for [duration].\" A small commitment to try something, not a goal to hit. Success = you ran it."),
        ("checklist", "PACT",
         "Purposeful (a question you care about), Actionable (a concrete thing you do), Continuous (repeated for a set time), Trackable (you know if you did it)."),
        ("arrow.triangle.2.circlepath", "Growth loops",
         "Act → reflect → adjust. Progress is loops, not a ladder. Each pact is one loop."),
        ("brain.head.profile", "Triple Check",
         "When you don't do it, ask why: Head (does it make sense?), Heart (does it feel good?), Hand (is it doable?). Each points to a different fix."),
        ("plusminus", "Plus / Minus / Next",
         "Three quick lines: what worked, what didn't, what you'll try next. Five minutes, max."),
        ("arrow.triangle.branch", "Persist / Pause / Pivot",
         "At the end of a pact, decide from the data: keep going, stop for now, or change one thing and start a new pact."),
        ("theatermasks", "Cognitive scripts",
         "Watch for the Sequel (doing what you've always done), the Crowd-pleaser (doing what others expect), and the Epic (one grand passion). Experiments break them."),
        ("note.text", "Field notes",
         "Jot what you notice — energy, mood, surprises. Patterns in the notes become your next hypothesis."),
        ("gearshape.2", "Operationalize (Tiny Lab)",
         "When a pact earns its place, make it a practice with a routine and no end date. Practices and their outputs build a capability."),
    ]

    var body: some View {
        List(entries, id: \.1) { entry in
            VStack(alignment: .leading, spacing: 6) {
                Label(entry.1, systemImage: entry.0).font(.headline)
                Text(entry.2).font(.subheadline).foregroundStyle(.secondary)
            }
            .padding(.vertical, 4)
        }
        .navigationTitle("Field guide")
    }
}
