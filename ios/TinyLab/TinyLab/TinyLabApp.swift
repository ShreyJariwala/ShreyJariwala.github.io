import SwiftData
import SwiftUI

enum SettingsKey {
    static let iCloudSync = "iCloudSyncEnabled"
    static let reminderOn = "reminderOn"
    static let reminderMinutes = "reminderMinutes"
}

@main
struct TinyLabApp: App {
    let container: ModelContainer

    init() {
        let schema = Schema([Pact.self, CheckIn.self, LabOutput.self, Capability.self])
        // Local-first: the on-device store is always the source of truth.
        // When iCloud sync is on (and the app has the iCloud/CloudKit capability),
        // SwiftData mirrors the same store to your private iCloud database.
        let wantsCloud = UserDefaults.standard.bool(forKey: SettingsKey.iCloudSync)
        let config = ModelConfiguration(schema: schema, cloudKitDatabase: wantsCloud ? .automatic : .none)
        do {
            container = try ModelContainer(for: schema, configurations: [config])
        } catch {
            // If CloudKit can't start (missing entitlement, no account), stay local.
            let local = ModelConfiguration(schema: schema, cloudKitDatabase: .none)
            do {
                container = try ModelContainer(for: schema, configurations: [local])
            } catch {
                fatalError("Could not open the local store: \(error)")
            }
        }
    }

    var body: some Scene {
        WindowGroup {
            RootView()
        }
        .modelContainer(container)
    }
}

struct RootView: View {
    var body: some View {
        TabView {
            TodayView()
                .tabItem { Label("Today", systemImage: "checkmark.circle") }
            LabView()
                .tabItem { Label("Lab", systemImage: "flask") }
            CapabilitiesView()
                .tabItem { Label("Capabilities", systemImage: "square.stack.3d.up") }
            SettingsView()
                .tabItem { Label("Settings", systemImage: "gearshape") }
        }
    }
}
