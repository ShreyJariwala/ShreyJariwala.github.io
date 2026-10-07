import SwiftData
import SwiftUI

/// Capability development programs: experiments -> practices -> capability.
struct CapabilitiesView: View {
    @Environment(\.modelContext) private var context
    @Query(sort: \Capability.createdAt) private var capabilities: [Capability]
    @State private var adding = false

    var body: some View {
        NavigationStack {
            List {
                ForEach(capabilities) { cap in
                    NavigationLink(value: cap) {
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Text(cap.name).font(.headline)
                                Spacer()
                                Text(cap.level.label)
                                    .font(.caption.weight(.semibold))
                                    .foregroundStyle(.tint)
                            }
                            LevelBar(level: cap.level)
                            Text("\(cap.experiments.count) experiments · \(cap.practices.count) practices · \(cap.repsLogged) reps")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        .padding(.vertical, 2)
                    }
                }
                .onDelete { offsets in
                    for i in offsets { context.delete(capabilities[i]) }
                }
            }
            .overlay {
                if capabilities.isEmpty {
                    ContentUnavailableView {
                        Label("No capabilities yet", systemImage: "square.stack.3d.up")
                    } description: {
                        Text("When an experiment earns its place, operationalize it. Practices roll up into capabilities you're building.")
                    } actions: {
                        Button("New capability") { adding = true }.buttonStyle(.borderedProminent)
                    }
                }
            }
            .navigationTitle("Capabilities")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button { adding = true } label: { Image(systemName: "plus") }
                }
            }
            .navigationDestination(for: Capability.self) { CapabilityDetailView(capability: $0) }
            .navigationDestination(for: Pact.self) { PactDetailView(pact: $0) }
            .sheet(isPresented: $adding) { NewCapabilityView() }
        }
    }
}

struct LevelBar: View {
    let level: CapabilityLevel

    var body: some View {
        HStack(spacing: 4) {
            ForEach(CapabilityLevel.allCases) { l in
                Capsule()
                    .fill(l.index <= level.index ? Color.accentColor : Color(.systemGray5))
                    .frame(height: 6)
            }
        }
    }
}

struct CapabilityDetailView: View {
    @Bindable var capability: Capability
    @State private var startingExperiment = false

    private var askedAt: Binding<Date> {
        Binding(get: { capability.questionDate }, set: { capability.askedAt = $0 })
    }

    var body: some View {
        List {
            Section {
                TextField("Name", text: $capability.name)
                    .font(.headline)
                Picker("Level", selection: $capability.levelRaw) {
                    ForEach(CapabilityLevel.allCases) { l in Text(l.label).tag(l.rawValue) }
                }
                LevelBar(level: capability.level)
            }

            Section {
                let headline = capability.bridgeHeadline
                VStack(alignment: .leading, spacing: 2) {
                    Text("\(headline.days) \(headline.days == 1 ? "day" : "days")")
                        .font(.title.weight(.bold))
                        .foregroundStyle(.tint)
                        .monospacedDigit()
                    Text(headline.caption)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                TextField("The question that started it", text: $capability.question, axis: .vertical)
                DatePicker("First asked", selection: askedAt, in: ...Date.now, displayedComponents: .date)
                ForEach(capability.milestones) { m in
                    LabeledContent(m.label) {
                        Text(m.date.map { "\($0.formatted(.dateTime.month().day())) · day \(capability.day(of: $0))" } ?? "not yet")
                            .monospacedDigit()
                    }
                    .foregroundStyle(m.date == nil ? .secondary : .primary)
                }
            } header: {
                Text("Question to capability")
            }

            Section("Program") {
                TextField("Why this matters to me", text: $capability.why, axis: .vertical)
                TextField("What good looks like", text: $capability.target, axis: .vertical)
            }

            Section("Evidence") {
                HStack {
                    StatTile(value: "\(capability.experiments.count)", label: "experiments")
                    StatTile(value: "\(capability.practices.count)", label: "practices")
                    StatTile(value: "\(capability.repsLogged)", label: "reps")
                    StatTile(value: "\(capability.operationalizedOutputs)/\(capability.allOutputs.count)", label: "outputs in use")
                }
            }

            Section {
                ForEach(capability.practices) { pact in
                    NavigationLink(value: pact) { PactSummaryRow(pact: pact) }
                }
                if capability.practices.isEmpty {
                    Text("Operationalize an experiment to add a practice.")
                        .font(.caption).foregroundStyle(.secondary)
                }
            } header: {
                Text("Practices (operationalized)")
            }

            Section {
                ForEach(capability.experiments) { pact in
                    NavigationLink(value: pact) { PactSummaryRow(pact: pact) }
                }
                Button("Start an experiment for this", systemImage: "plus.circle") { startingExperiment = true }
            } header: {
                Text("Experiments")
            }

            if !capability.allOutputs.isEmpty {
                Section("Outputs") {
                    ForEach(capability.allOutputs.prefix(15)) { output in
                        HStack {
                            Label(output.title, systemImage: output.kind.symbol)
                            Spacer()
                            if output.isOperationalized {
                                Image("tl-in-use").resizable().frame(width: 16, height: 16).foregroundStyle(.tint)
                            }
                        }
                    }
                }
            }
        }
        .navigationTitle(capability.name.isEmpty ? "Capability" : capability.name)
        .navigationBarTitleDisplayMode(.inline)
        .onChange(of: capability.levelRaw) { _, _ in capability.stampLevelDates() }
        .sheet(isPresented: $startingExperiment) { PactEditorView(mode: .new(capability)) }
    }
}

struct NewCapabilityView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var context
    @State private var name = ""
    @State private var why = ""
    @State private var target = ""
    @State private var level: CapabilityLevel = .exploring
    @State private var question = ""
    @State private var askedAt = Date.now

    var body: some View {
        NavigationStack {
            Form {
                TextField("Capability, e.g. Data storytelling", text: $name)
                TextField("The question that started it", text: $question, axis: .vertical)
                DatePicker("First asked", selection: $askedAt, in: ...Date.now, displayedComponents: .date)
                TextField("Why it matters", text: $why, axis: .vertical)
                TextField("What good looks like", text: $target, axis: .vertical)
                Picker("Current level", selection: $level) {
                    ForEach(CapabilityLevel.allCases) { l in Text(l.label).tag(l) }
                }
            }
            .navigationTitle("New capability")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        let c = Capability(name: name.trimmingCharacters(in: .whitespaces), why: why)
                        c.target = target
                        c.level = level
                        c.question = question.trimmingCharacters(in: .whitespacesAndNewlines)
                        c.askedAt = askedAt
                        c.stampLevelDates()
                        context.insert(c)
                        dismiss()
                    }
                    .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
    }
}
