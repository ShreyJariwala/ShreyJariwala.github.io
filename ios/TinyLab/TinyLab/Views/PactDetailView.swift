import SwiftData
import SwiftUI

struct PactDetailView: View {
    @Environment(\.modelContext) private var context
    @Environment(\.dismiss) private var dismiss
    @Bindable var pact: Pact

    @State private var editing = false
    @State private var pivoting = false
    @State private var addingOutput = false
    @State private var editingOutput: LabOutput?
    @State private var operationalizing = false
    @State private var noteDay: DayRef?
    @State private var extraDays = 14
    @State private var confirmDelete = false

    private let columns = Array(repeating: GridItem(.flexible(), spacing: 6), count: 7)

    var body: some View {
        List {
            header
            stats
            grid
            if !pact.missReasonCounts.isEmpty { tripleCheck }
            outputs
            review
            operationalize
        }
        .navigationTitle(pact.status.label)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Menu {
                    Button("Edit pact", systemImage: "pencil") { editing = true }
                    if pact.status == .active {
                        Button("Pause", systemImage: "pause") { pact.pause() }
                    } else if pact.status == .paused || pact.status == .completed {
                        Button("Resume", systemImage: "play") { pact.resume() }
                    }
                    Button("Delete", systemImage: "trash", role: .destructive) { confirmDelete = true }
                } label: {
                    Image(systemName: "ellipsis.circle")
                }
            }
        }
        .sheet(isPresented: $editing) { PactEditorView(mode: .edit(pact)) }
        .sheet(isPresented: $pivoting) { PactEditorView(mode: .pivot(pact)) }
        .sheet(isPresented: $addingOutput) { OutputEditorView(pact: pact, output: nil) }
        .sheet(item: $editingOutput) { output in OutputEditorView(pact: pact, output: output) }
        .sheet(isPresented: $operationalizing) { OperationalizeSheet(pact: pact) }
        .sheet(item: $noteDay) { ref in LogSheet(pact: pact, day: ref.date) }
        .confirmationDialog("Delete this pact and all its logs?", isPresented: $confirmDelete, titleVisibility: .visible) {
            Button("Delete", role: .destructive) {
                // Leave the screen first so nothing renders a deleted model.
                let doomed = pact
                dismiss()
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) {
                    context.delete(doomed)
                }
            }
        }
    }

    // MARK: Sections

    private var header: some View {
        Section {
            VStack(alignment: .leading, spacing: 8) {
                StatusBadge(status: pact.status)
                Text(pact.title)
                    .font(.title3.weight(.bold))
                if !pact.question.isEmpty {
                    Label(pact.question, systemImage: "questionmark.bubble")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                Text(dateLine)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                if let cap = pact.capability {
                    Label("Builds: \(cap.name)", systemImage: "square.stack.3d.up")
                        .font(.caption.weight(.medium))
                }
                if pact.status == .operationalized && !pact.routine.isEmpty {
                    Label(pact.routine, systemImage: "repeat")
                        .font(.caption)
                }
            }
            .padding(.vertical, 4)
        }
    }

    private var dateLine: String {
        let start = pact.startDay.formatted(date: .abbreviated, time: .omitted)
        if pact.status == .operationalized {
            let since = (pact.operationalizedAt ?? .now).formatted(date: .abbreviated, time: .omitted)
            return "Started \(start) · practice since \(since)"
        }
        let end = pact.endDay.formatted(date: .abbreviated, time: .omitted)
        return "\(start) → \(end)"
    }

    private var stats: some View {
        Section {
            HStack {
                StatTile(value: "\(pact.doneCount)/\(pact.trackedDays())", label: "done")
                StatTile(value: pact.hitRate().percent, label: "hit rate")
                StatTile(value: "\(pact.currentStreak())", label: "streak")
                StatTile(value: "\(pact.bestStreak)", label: "best")
                if !pact.metricName.isEmpty {
                    StatTile(value: pact.metricTotal.compact, label: pact.metricName)
                }
            }
        }
    }

    private var grid: some View {
        Section {
            LazyVGrid(columns: columns, spacing: 6) {
                ForEach(pact.gridDays, id: \.self) { day in
                    let entry = pact.checkIn(on: day)
                    DayCell(day: day, state: entry?.didIt, hasNote: !(entry?.note.isEmpty ?? true))
                        .onTapGesture {
                            guard !day.isFuture else { return }
                            pact.cycleLog(on: day, in: context)
                        }
                        .contextMenu {
                            if !day.isFuture {
                                Button("Field note / value", systemImage: "square.and.pencil") {
                                    noteDay = DayRef(date: day)
                                }
                            }
                        }
                }
            }
            .padding(.vertical, 4)
        } header: {
            Text("Log")
        } footer: {
            Text("Tap a day to cycle it: done, missed, clear. Long-press to add a field note.")
        }
    }

    private var tripleCheck: some View {
        Section {
            ForEach(pact.missReasonCounts, id: \.0) { item in
                HStack {
                    Label(item.0.label, systemImage: item.0.symbol)
                    Spacer()
                    Text("\(item.1)×").monospacedDigit().foregroundStyle(.secondary)
                }
            }
        } header: {
            Text("Triple Check — why I missed")
        } footer: {
            Text(tripleCheckHint)
        }
    }

    private var tripleCheckHint: String {
        guard let top = pact.missReasonCounts.max(by: { $0.1 < $1.1 })?.0 else { return "" }
        switch top {
        case .head: return "Mostly Head: clarify why this matters, or change the question."
        case .heart: return "Mostly Heart: redesign it so it's more fun — or pivot."
        case .hand: return "Mostly Hand: make it smaller or easier to start."
        case .life: return "Mostly Life: consider a different time slot."
        }
    }

    private var outputs: some View {
        Section {
            ForEach(pact.sortedOutputs) { output in
                Button { editingOutput = output } label: {
                    HStack {
                        Label(output.title, systemImage: output.kind.symbol)
                            .foregroundStyle(.primary)
                        Spacer()
                        if output.isOperationalized {
                            Image("tl-in-use").resizable().frame(width: 16, height: 16).foregroundStyle(.tint)
                        }
                        Text(output.date.formatted(.dateTime.month().day()))
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .onDelete { offsets in
                let items = pact.sortedOutputs
                for i in offsets {
                    let doomed = items[i]
                    pact.outputs?.removeAll { $0.persistentModelID == doomed.persistentModelID }
                    context.delete(doomed)
                }
            }
            Button("Log output", systemImage: "plus.circle") { addingOutput = true }
        } header: {
            Text("Outputs")
        } footer: {
            Text("What did this experiment produce? Insights, things you made, data. The plug marks outputs that are in use.")
        }
    }

    private var review: some View {
        Section {
            TextField("Plus — what worked", text: $pact.plus, axis: .vertical)
            TextField("Minus — what didn't", text: $pact.minus, axis: .vertical)
            TextField("Next — what I'll try", text: $pact.nextStep, axis: .vertical)

            if pact.status == .active || pact.status == .paused {
                Stepper("Persist: +\(extraDays) days", value: $extraDays, in: 1...90)
                Button("Persist — keep going", systemImage: "arrow.clockwise") { pact.persist(extraDays: extraDays) }
                Button("Pause — stop for now", systemImage: "pause") { pact.pause() }
                    .disabled(pact.status == .paused)
                Button("Pivot — change it & start a new pact", systemImage: "arrow.triangle.branch") { pivoting = true }
            }
            if pact.decision != .undecided {
                LabeledContent("Decision", value: pact.decision.label)
            }
        } header: {
            Text(pact.needsReview ? "Review — pact finished" : "Review")
        } footer: {
            Text("Success = you ran the pact, not the outcome. Decide from the data.")
        }
    }

    private var operationalize: some View {
        Section {
            if pact.status == .operationalized {
                Button("Edit routine & capability", systemImage: "slider.horizontal.3") { operationalizing = true }
                Button("Retire practice", systemImage: "archivebox") { pact.status = .completed }
            } else {
                Button("Operationalize: make it a practice", systemImage: "gearshape.2") { operationalizing = true }
            }
        } header: {
            Text("Operationalize")
        } footer: {
            Text("A practice has no end date. It keeps its log and feeds a capability program.")
        }
    }
}

// MARK: - Operationalize

struct OperationalizeSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var context
    @Query(sort: \Capability.name) private var capabilities: [Capability]
    let pact: Pact

    @State private var routine = ""
    @State private var capability: Capability?
    @State private var newCapabilityName = ""

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("e.g. Weekdays 7:00, 20 min before email", text: $routine, axis: .vertical)
                } header: {
                    Text("Routine — how it lives in my system")
                } footer: {
                    Text("It's no longer a test. It runs on a schedule and you keep logging it.")
                }

                Section("Capability it builds") {
                    Picker("Capability", selection: $capability) {
                        Text("None").tag(Capability?.none)
                        ForEach(capabilities) { c in
                            Text(c.name).tag(Capability?.some(c))
                        }
                    }
                    TextField("…or start a new capability", text: $newCapabilityName)
                }
            }
            .navigationTitle("Operationalize")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) { Button("Save", action: save) }
            }
            .onAppear {
                routine = pact.routine
                capability = pact.capability
            }
        }
    }

    private func save() {
        var target = capability
        let name = newCapabilityName.trimmingCharacters(in: .whitespacesAndNewlines)
        if !name.isEmpty {
            let created = Capability(name: name)
            context.insert(created)
            target = created
        }
        pact.operationalize(into: target, routine: routine)
        dismiss()
    }
}

// MARK: - Output editor

struct OutputEditorView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var context
    let pact: Pact
    let output: LabOutput?

    @State private var title = ""
    @State private var detail = ""
    @State private var kind: OutputKind = .insight
    @State private var link = ""
    @State private var date = Date.now
    @State private var isOperationalized = false
    @State private var operationalNote = ""

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("What came out of it?", text: $title)
                    Picker("Type", selection: $kind) {
                        ForEach(OutputKind.allCases) { k in
                            Label(k.label, systemImage: k.symbol).tag(k)
                        }
                    }
                    DatePicker("Date", selection: $date, displayedComponents: .date)
                }
                Section("Details") {
                    TextField("Notes", text: $detail, axis: .vertical)
                        .lineLimit(3...10)
                    TextField("Link (optional)", text: $link)
                        .keyboardType(.URL)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                }
                Section {
                    Toggle("Operationalized", isOn: $isOperationalized)
                    if isOperationalized {
                        TextField("Where is it used now?", text: $operationalNote, axis: .vertical)
                    }
                } footer: {
                    Text("Turn on when this output is put to work — in a workflow, a tool, a habit.")
                }
            }
            .navigationTitle(output == nil ? "Log output" : "Output")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save", action: save)
                        .disabled(title.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
            .onAppear {
                guard let output else { return }
                title = output.title
                detail = output.detail
                kind = output.kind
                link = output.link
                date = output.date
                isOperationalized = output.isOperationalized
                operationalNote = output.operationalNote
            }
        }
    }

    private func save() {
        let target: LabOutput
        if let output {
            target = output
        } else {
            target = LabOutput(title: title)
            context.insert(target)
            target.pact = pact
        }
        target.title = title.trimmingCharacters(in: .whitespaces)
        target.detail = detail
        target.kind = kind
        target.link = link
        target.date = date
        target.isOperationalized = isOperationalized
        target.operationalNote = operationalNote
        dismiss()
    }
}
