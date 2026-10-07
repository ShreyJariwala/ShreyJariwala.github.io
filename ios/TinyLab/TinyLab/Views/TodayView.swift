import SwiftData
import SwiftUI

/// The tactical screen: did I run each experiment today? One tap each.
struct TodayView: View {
    @Query(sort: \Pact.createdAt) private var pacts: [Pact]
    @State private var showingNew = false
    @State private var opened: Pact?
    @State private var noting: Pact?

    private var running: [Pact] {
        pacts.filter { $0.status == .active && !$0.needsReview && $0.dayNumber() >= 1 }
    }
    private var upcoming: [Pact] {
        pacts.filter { $0.status == .active && $0.dayNumber() < 1 }
    }
    private var practices: [Pact] { pacts.filter { $0.status == .operationalized } }
    private var toReview: [Pact] { pacts.filter(\.needsReview) }
    private var loggable: [Pact] { running + practices }
    private var loggedToday: Int { loggable.filter { $0.checkIn(on: .now) != nil }.count }
    private var isEmpty: Bool { running.isEmpty && practices.isEmpty && toReview.isEmpty && upcoming.isEmpty }

    var body: some View {
        NavigationStack {
            List {
                if !loggable.isEmpty {
                    Section {
                        ProgressView(value: Double(loggedToday), total: Double(loggable.count)) {
                            Text("\(loggedToday) of \(loggable.count) logged today")
                                .font(.subheadline.weight(.medium))
                        }
                    }
                }

                if !toReview.isEmpty {
                    Section {
                        ForEach(toReview) { pact in
                            Button { opened = pact } label: {
                                Label(pact.action, systemImage: "checklist")
                            }
                        }
                    } header: {
                        Text("Pact finished — persist, pause or pivot?")
                    }
                }

                if !running.isEmpty {
                    Section("Experiments") {
                        ForEach(running) { pact in
                            TodayRow(pact: pact, onOpen: { opened = pact }, onNote: { noting = pact })
                        }
                    }
                }

                if !practices.isEmpty {
                    Section("Practices") {
                        ForEach(practices) { pact in
                            TodayRow(pact: pact, onOpen: { opened = pact }, onNote: { noting = pact })
                        }
                    }
                }

                if !upcoming.isEmpty {
                    Section("Upcoming") {
                        ForEach(upcoming) { pact in
                            Button { opened = pact } label: {
                                VStack(alignment: .leading) {
                                    Text(pact.action).foregroundStyle(.primary)
                                    Text("Starts \(pact.startDate.formatted(date: .abbreviated, time: .omitted))")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                            }
                        }
                    }
                }
            }
            .overlay {
                if isEmpty {
                    ContentUnavailableView {
                        Label("No experiments running", systemImage: "flask")
                    } description: {
                        Text("Make a pact: I will [action] for [duration].")
                    } actions: {
                        Button("New pact") { showingNew = true }
                            .buttonStyle(.borderedProminent)
                    }
                }
            }
            .navigationTitle("Today")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button { showingNew = true } label: { Image(systemName: "plus") }
                }
            }
            .navigationDestination(item: $opened) { pact in
                PactDetailView(pact: pact)
            }
            .sheet(isPresented: $showingNew) { PactEditorView() }
            .sheet(item: $noting) { pact in LogSheet(pact: pact, day: .now) }
        }
    }
}

struct TodayRow: View {
    @Environment(\.modelContext) private var context
    let pact: Pact
    let onOpen: () -> Void
    let onNote: () -> Void
    @State private var askingWhy = false

    private var today: CheckIn? { pact.checkIn(on: .now) }

    /// "Day 5/14 · [streak icon] 3 · 80%". The streak glyph is the custom tl-streak-inline icon (12pt).
    private var subtitle: Text {
        let streak = pact.currentStreak()
        let streakText = streak > 0 ? Text(" · \(Image("tl-streak-inline")) \(streak)") : Text(verbatim: "")
        if pact.status == .operationalized {
            let cap = pact.capability.map { " · \($0.name)" } ?? ""
            return Text("Practice\(cap)\(streakText)")
        }
        let day = min(pact.dayNumber(), pact.durationDays)
        return Text("Day \(day)/\(pact.durationDays)\(streakText) · \(pact.hitRate().percent)")
    }

    var body: some View {
        HStack(spacing: 10) {
            VStack(alignment: .leading, spacing: 4) {
                Text(pact.action)
                    .font(.headline)
                    .lineLimit(2)
                subtitle
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .contentShape(Rectangle())
            .onTapGesture(perform: onOpen)

            LogButton(symbol: "xmark", tint: .red, isOn: today?.didIt == false) {
                if today?.didIt == false {
                    pact.clearLog(on: .now, in: context)
                } else {
                    pact.log(false, in: context)
                    askingWhy = true
                }
            }
            LogButton(symbol: "checkmark", tint: .green, isOn: today?.didIt == true) {
                if today?.didIt == true {
                    pact.clearLog(on: .now, in: context)
                } else {
                    pact.log(true, in: context)
                    if !pact.metricName.isEmpty { onNote() }
                }
            }
        }
        .padding(.vertical, 4)
        .sensoryFeedback(.success, trigger: today?.didIt) { _, new in new == true }
        .confirmationDialog("What got in the way?", isPresented: $askingWhy, titleVisibility: .visible) {
            ForEach(MissReason.allCases) { reason in
                Button("\(reason.label): \(reason.prompt)") {
                    pact.checkIn(on: .now)?.missReason = reason
                }
            }
            Button("Skip", role: .cancel) {}
        } message: {
            Text("Triple Check. No judgment — it's data.")
        }
        .contextMenu {
            Button("Field note / value", systemImage: "square.and.pencil", action: onNote)
            Button("Open", systemImage: "arrow.right.circle", action: onOpen)
        }
    }
}

/// Edit one day's log: result, number, miss reason, field note.
struct LogSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var context
    let pact: Pact
    let day: Date

    @State private var didIt = true
    @State private var value: Double?
    @State private var note = ""
    @State private var reason: MissReason?

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Picker("Result", selection: $didIt) {
                        Text("Did it").tag(true)
                        Text("Didn't").tag(false)
                    }
                    .pickerStyle(.segmented)
                } footer: {
                    Text(pact.action)
                }

                if !pact.metricName.isEmpty {
                    Section(pact.metricName.capitalized) {
                        TextField(pact.metricName, value: $value, format: .number)
                            .keyboardType(.decimalPad)
                    }
                }

                if !didIt {
                    Section("Triple Check") {
                        Picker("What got in the way?", selection: $reason) {
                            Text("—").tag(MissReason?.none)
                            ForEach(MissReason.allCases) { r in
                                Label(r.label, systemImage: r.symbol).tag(MissReason?.some(r))
                            }
                        }
                    }
                }

                Section("Field note") {
                    TextField("What did I notice? Energy, mood, surprises…", text: $note, axis: .vertical)
                        .lineLimit(3...8)
                }
            }
            .navigationTitle(day.formatted(.dateTime.weekday(.wide).month().day()))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) { Button("Save", action: save) }
            }
            .onAppear {
                if let c = pact.checkIn(on: day) {
                    didIt = c.didIt
                    value = c.value
                    note = c.note
                    reason = c.missReason
                }
            }
        }
        .presentationDetents([.medium, .large])
    }

    private func save() {
        let entry = pact.log(didIt, on: day, in: context)
        entry.value = value
        entry.note = note
        entry.missReason = didIt ? nil : reason
        dismiss()
    }
}
