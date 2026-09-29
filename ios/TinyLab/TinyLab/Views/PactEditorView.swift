import SwiftData
import SwiftUI

/// Create, edit, or pivot a pact: "I will [action] for [duration]."
struct PactEditorView: View {
    enum Mode {
        case new(Capability?)
        case edit(Pact)
        case pivot(Pact)
    }

    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var context
    @Query(sort: \Capability.name) private var capabilities: [Capability]
    let mode: Mode

    @State private var action = ""
    @State private var question = ""
    @State private var durationDays = 14
    @State private var startDate = Date.now
    @State private var metricName = ""
    @State private var capability: Capability?
    @State private var loaded = false

    private let presets = [7, 14, 21, 30]

    init(mode: Mode = .new(nil)) {
        self.mode = mode
    }

    private var trimmedAction: String {
        action.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    private var navTitle: String {
        switch mode {
        case .new: "New pact"
        case .edit: "Edit pact"
        case .pivot: "Pivot"
        }
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    HStack(alignment: .firstTextBaseline) {
                        Text("I will").foregroundStyle(.secondary)
                        TextField("write 200 words", text: $action, axis: .vertical)
                    }
                    Stepper("for \(durationDays) days", value: $durationDays, in: 1...365)
                    Picker("Duration", selection: $durationDays) {
                        ForEach(presets, id: \.self) { d in Text("\(d)d").tag(d) }
                    }
                    .pickerStyle(.segmented)
                } header: {
                    Text("The pact")
                } footer: {
                    if case .pivot = mode {
                        Text("Pivot: keep what worked, change one thing.")
                    } else {
                        Text("Small and repeatable beats big and vague.")
                    }
                }

                Section {
                    TextField("What am I curious to find out?", text: $question, axis: .vertical)
                } header: {
                    Text("Purposeful — the question")
                }

                Section {
                    TextField("minutes, pages, reps… (optional)", text: $metricName)
                        .textInputAutocapitalization(.never)
                } header: {
                    Text("Trackable — one number per day")
                } footer: {
                    Text("Leave blank to just log did / didn't.")
                }

                Section("Schedule") {
                    DatePicker("Start", selection: $startDate, displayedComponents: .date)
                }

                Section("Capability program") {
                    Picker("Builds toward", selection: $capability) {
                        Text("None").tag(Capability?.none)
                        ForEach(capabilities) { c in
                            Text(c.name).tag(Capability?.some(c))
                        }
                    }
                }

                Section("PACT check") {
                    check("Purposeful", ok: !question.isEmpty, hint: "Add a question")
                    check("Actionable", ok: !trimmedAction.isEmpty, hint: "Name a concrete action")
                    check("Continuous", ok: durationDays >= 3, hint: "Repeat it a few days at least")
                    check("Trackable", ok: true, hint: "")
                }
            }
            .navigationTitle(navTitle)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save", action: save).disabled(trimmedAction.isEmpty)
                }
            }
            .onAppear(perform: load)
        }
    }

    private func check(_ label: String, ok: Bool, hint: String) -> some View {
        HStack {
            Image(systemName: ok ? "checkmark.circle.fill" : "circle")
                .foregroundStyle(ok ? Color.green : Color.secondary)
            Text(label)
            Spacer()
            if !ok {
                Text(hint).font(.caption).foregroundStyle(.secondary)
            }
        }
    }

    private func load() {
        guard !loaded else { return }
        loaded = true
        switch mode {
        case .new(let preset):
            capability = preset
        case .edit(let p):
            fill(from: p)
            startDate = p.startDate
        case .pivot(let p):
            fill(from: p)
            if !p.nextStep.isEmpty { question = p.nextStep }
            startDate = .now
        }
    }

    private func fill(from p: Pact) {
        action = p.action
        question = p.question
        durationDays = p.durationDays
        metricName = p.metricName
        capability = p.capability
    }

    private func save() {
        let target: Pact
        switch mode {
        case .new:
            target = Pact(action: trimmedAction)
            context.insert(target)
        case .edit(let p):
            target = p
        case .pivot(let p):
            target = p.pivot(in: context)
        }
        target.action = trimmedAction
        target.question = question.trimmingCharacters(in: .whitespacesAndNewlines)
        target.durationDays = durationDays
        target.startDate = startDate
        target.metricName = metricName.trimmingCharacters(in: .whitespacesAndNewlines)
        target.capability = capability
        dismiss()
    }
}
