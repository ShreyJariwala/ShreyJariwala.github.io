import SwiftData
import SwiftUI

/// Every pact ever run — where am I at across all experiments.
struct LabView: View {
    enum Filter: String, CaseIterable, Identifiable {
        case all = "All", running = "Running", practices = "Practices", done = "Done", paused = "Paused"
        var id: String { rawValue }
    }

    @Query(sort: \Pact.createdAt, order: .reverse) private var pacts: [Pact]
    @State private var filter: Filter = .all
    @State private var showingNew = false

    private var filtered: [Pact] {
        switch filter {
        case .all: pacts
        case .running: pacts.filter { $0.status == .active }
        case .practices: pacts.filter { $0.status == .operationalized }
        case .done: pacts.filter { $0.status == .completed }
        case .paused: pacts.filter { $0.status == .paused }
        }
    }

    private var totalReps: Int { pacts.map(\.doneCount).reduce(0, +) }
    private var totalOutputs: Int { pacts.map { $0.outputs?.count ?? 0 }.reduce(0, +) }
    private var overallRate: Double {
        let due = pacts.map { $0.trackedDays() }.reduce(0, +)
        return due > 0 ? min(Double(totalReps) / Double(due), 1) : 0
    }

    var body: some View {
        NavigationStack {
            List {
                Section {
                    HStack {
                        StatTile(value: "\(pacts.count)", label: "pacts")
                        StatTile(value: "\(totalReps)", label: "reps")
                        StatTile(value: overallRate.percent, label: "hit rate")
                        StatTile(value: "\(totalOutputs)", label: "outputs")
                    }
                }

                Section {
                    Picker("Filter", selection: $filter) {
                        ForEach(Filter.allCases) { f in Text(f.rawValue).tag(f) }
                    }
                    .pickerStyle(.segmented)
                    .listRowBackground(Color.clear)
                    .listRowInsets(EdgeInsets())
                }

                Section {
                    ForEach(filtered) { pact in
                        NavigationLink(value: pact) { PactSummaryRow(pact: pact) }
                    }
                }
            }
            .overlay {
                if pacts.isEmpty {
                    ContentUnavailableView("Your lab is empty", systemImage: "flask",
                                           description: Text("Pacts you start show up here."))
                }
            }
            .navigationTitle("Lab")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button { showingNew = true } label: { Image(systemName: "plus") }
                }
            }
            .navigationDestination(for: Pact.self) { PactDetailView(pact: $0) }
            .sheet(isPresented: $showingNew) { PactEditorView() }
        }
    }
}

struct PactSummaryRow: View {
    let pact: Pact

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(spacing: 6) {
                Image(systemName: pact.status.symbol).foregroundStyle(.tint)
                Text(pact.action).font(.headline).lineLimit(2)
            }
            HStack(spacing: 8) {
                Text(pact.startDay.formatted(.dateTime.month().day()))
                Text("\(pact.hitRate().percent) · \(pact.doneCount) reps")
                if let n = pact.outputs?.count, n > 0 { Text("· \(n) outputs") }
                if pact.pivotedFromID != nil { Text("· pivot") }
            }
            .font(.caption)
            .foregroundStyle(.secondary)
            if pact.needsReview {
                Text("Needs review").font(.caption.weight(.semibold)).foregroundStyle(.orange)
            }
        }
        .padding(.vertical, 2)
    }
}
