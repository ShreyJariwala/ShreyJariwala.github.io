import Foundation
import SwiftData

// All stored properties have defaults and relationships are optional so the
// same schema works locally and with CloudKit sync (CloudKit requires both).

// MARK: - Enums

enum PactStatus: String, Codable, CaseIterable, Identifiable {
    case active, paused, completed, operationalized
    var id: String { rawValue }

    var label: String {
        switch self {
        case .active: "Running"
        case .paused: "Paused"
        case .completed: "Done"
        case .operationalized: "Practice"
        }
    }

    var symbol: String {
        switch self {
        case .active: "flask"
        case .paused: "pause.circle"
        case .completed: "checkmark.seal"
        case .operationalized: "gearshape.2"
        }
    }
}

/// End-of-pact decision from the book: persist, pause, or pivot.
enum PactDecision: String, Codable, CaseIterable, Identifiable {
    case undecided, persist, pause, pivot
    var id: String { rawValue }

    var label: String {
        switch self {
        case .undecided: "Undecided"
        case .persist: "Persist"
        case .pause: "Pause"
        case .pivot: "Pivot"
        }
    }
}

/// Triple Check: why didn't I do it today?
enum MissReason: String, Codable, CaseIterable, Identifiable {
    case head, heart, hand, life
    var id: String { rawValue }

    var label: String {
        switch self {
        case .head: "Head"
        case .heart: "Heart"
        case .hand: "Hand"
        case .life: "Life happened"
        }
    }

    var prompt: String {
        switch self {
        case .head: "Didn't make sense / unclear why"
        case .heart: "Didn't feel like it / not exciting"
        case .hand: "Too hard / no time / no tools"
        case .life: "Outside my control"
        }
    }

    var symbol: String {
        switch self {
        case .head: "brain.head.profile"
        case .heart: "heart"
        case .hand: "hand.raised"
        case .life: "cloud.rain"
        }
    }
}

enum OutputKind: String, Codable, CaseIterable, Identifiable {
    case insight, artifact, data, link
    var id: String { rawValue }

    var label: String { rawValue.capitalized }

    var symbol: String {
        switch self {
        case .insight: "lightbulb"
        case .artifact: "hammer"
        case .data: "chart.bar"
        case .link: "link"
        }
    }
}

enum CapabilityLevel: String, Codable, CaseIterable, Identifiable {
    case exploring, practicing, proficient, teaching
    var id: String { rawValue }

    var label: String { rawValue.capitalized }

    var index: Int { Self.allCases.firstIndex(of: self) ?? 0 }
}

// MARK: - Pact (an experiment)

@Model
final class Pact {
    var id: UUID = UUID()
    /// The "[action]" in "I will [action] for [duration]".
    var action: String = ""
    /// Purposeful: the curiosity question this pact is testing.
    var question: String = ""
    var durationDays: Int = 14
    var startDate: Date = Date()
    /// Optional simple number to track per day, e.g. "minutes" or "pages".
    var metricName: String = ""
    var statusRaw: String = PactStatus.active.rawValue
    var decisionRaw: String = PactDecision.undecided.rawValue
    // Plus / Minus / Next review.
    var plus: String = ""
    var minus: String = ""
    var nextStep: String = ""
    /// How the pact lives in my system once operationalized.
    var routine: String = ""
    var operationalizedAt: Date?
    var pivotedFromID: UUID?
    var createdAt: Date = Date()

    @Relationship(deleteRule: .cascade, inverse: \CheckIn.pact)
    var checkIns: [CheckIn]? = []

    @Relationship(deleteRule: .cascade, inverse: \LabOutput.pact)
    var outputs: [LabOutput]? = []

    var capability: Capability?

    init(action: String, question: String = "", durationDays: Int = 14, startDate: Date = .now, metricName: String = "") {
        self.id = UUID()
        self.action = action
        self.question = question
        self.durationDays = durationDays
        self.startDate = startDate
        self.metricName = metricName
        self.createdAt = .now
    }

    var status: PactStatus {
        get { PactStatus(rawValue: statusRaw) ?? .active }
        set { statusRaw = newValue.rawValue }
    }

    var decision: PactDecision {
        get { PactDecision(rawValue: decisionRaw) ?? .undecided }
        set { decisionRaw = newValue.rawValue }
    }

    var title: String {
        status == .operationalized ? action : "I will \(action) for \(durationDays) days"
    }

    var startDay: Date { startDate.startOfDay }

    var endDay: Date { startDay.adding(days: max(durationDays, 1) - 1) }

    /// 1-based day number of `date` within the pact (can be <= 0 before start).
    func dayNumber(on date: Date = .now) -> Int {
        Date.daysBetween(startDay, date.startOfDay) + 1
    }

    /// An active pact whose duration has run out and is waiting for a decision.
    var needsReview: Bool {
        status == .active && Date.now.startOfDay > endDay
    }

    var sortedCheckIns: [CheckIn] {
        (checkIns ?? []).sorted { $0.day < $1.day }
    }

    var sortedOutputs: [LabOutput] {
        (outputs ?? []).sorted { $0.date > $1.date }
    }

    func checkIn(on date: Date) -> CheckIn? {
        let day = date.startOfDay
        return (checkIns ?? []).first { $0.day.startOfDay == day }
    }

    var doneCount: Int { (checkIns ?? []).filter(\.didIt).count }
    var missedCount: Int { (checkIns ?? []).filter { !$0.didIt }.count }

    /// Days that have been "due" so far — the denominator for the hit rate.
    func trackedDays(asOf date: Date = .now) -> Int {
        let n = dayNumber(on: date)
        if status == .operationalized { return max(n, 0) }
        return max(0, min(n, durationDays))
    }

    func hitRate(asOf date: Date = .now) -> Double {
        let days = trackedDays(asOf: date)
        guard days > 0 else { return 0 }
        return min(Double(doneCount) / Double(days), 1)
    }

    /// Consecutive "did it" days ending today (or yesterday if today isn't logged yet).
    func currentStreak(asOf date: Date = .now) -> Int {
        let done = Set((checkIns ?? []).filter(\.didIt).map { $0.day.startOfDay })
        var day = date.startOfDay
        if !done.contains(day) { day = day.adding(days: -1) }
        var count = 0
        while done.contains(day) {
            count += 1
            day = day.adding(days: -1)
        }
        return count
    }

    var bestStreak: Int {
        let days = Set((checkIns ?? []).filter(\.didIt).map { $0.day.startOfDay }).sorted()
        var best = 0, run = 0
        var previous: Date?
        for day in days {
            if let previous, Date.daysBetween(previous, day) == 1 { run += 1 } else { run = 1 }
            best = max(best, run)
            previous = day
        }
        return best
    }

    var metricTotal: Double {
        (checkIns ?? []).compactMap(\.value).reduce(0, +)
    }

    var missReasonCounts: [(MissReason, Int)] {
        let reasons = (checkIns ?? []).compactMap(\.missReason)
        return MissReason.allCases.compactMap { reason -> (MissReason, Int)? in
            let count = reasons.filter { $0 == reason }.count
            return count > 0 ? (reason, count) : nil
        }
    }

    /// Days shown in the tracking grid.
    var gridDays: [Date] {
        let last = status == .operationalized ? max(Date.now.startOfDay, startDay) : endDay
        let count = Date.daysBetween(startDay, last) + 1
        return (0..<max(count, 1)).map { startDay.adding(days: $0) }
    }
}

// MARK: - CheckIn (one day's log)

@Model
final class CheckIn {
    var id: UUID = UUID()
    var day: Date = Date()
    var didIt: Bool = true
    var value: Double?
    /// Field note: what I noticed today.
    var note: String = ""
    var missReasonRaw: String = ""
    var createdAt: Date = Date()
    var pact: Pact?

    init(day: Date, didIt: Bool) {
        self.id = UUID()
        self.day = day.startOfDay
        self.didIt = didIt
        self.createdAt = .now
    }

    var missReason: MissReason? {
        get { didIt ? nil : MissReason(rawValue: missReasonRaw) }
        set { missReasonRaw = newValue?.rawValue ?? "" }
    }
}

// MARK: - LabOutput (what the experiment produced)

@Model
final class LabOutput {
    var id: UUID = UUID()
    var date: Date = Date()
    var title: String = ""
    var detail: String = ""
    var kindRaw: String = OutputKind.insight.rawValue
    var link: String = ""
    /// Did I put this output to work (in a workflow, a tool, a habit)?
    var isOperationalized: Bool = false
    var operationalNote: String = ""
    var pact: Pact?

    init(title: String, kind: OutputKind = .insight) {
        self.id = UUID()
        self.date = .now
        self.title = title
        self.kindRaw = kind.rawValue
    }

    var kind: OutputKind {
        get { OutputKind(rawValue: kindRaw) ?? .insight }
        set { kindRaw = newValue.rawValue }
    }
}

// MARK: - Capability (development program)

@Model
final class Capability {
    var id: UUID = UUID()
    var name: String = ""
    /// Why this capability matters to me.
    var why: String = ""
    /// What "good" looks like — the program's north star, not a rigid goal.
    var target: String = ""
    var levelRaw: String = CapabilityLevel.exploring.rawValue
    var createdAt: Date = Date()

    @Relationship(deleteRule: .nullify, inverse: \Pact.capability)
    var pacts: [Pact]? = []

    init(name: String, why: String = "") {
        self.id = UUID()
        self.name = name
        self.why = why
        self.createdAt = .now
    }

    var level: CapabilityLevel {
        get { CapabilityLevel(rawValue: levelRaw) ?? .exploring }
        set { levelRaw = newValue.rawValue }
    }

    var allPacts: [Pact] { (pacts ?? []).sorted { $0.createdAt > $1.createdAt } }
    var experiments: [Pact] { allPacts.filter { $0.status != .operationalized } }
    var practices: [Pact] { allPacts.filter { $0.status == .operationalized } }
    var allOutputs: [LabOutput] { allPacts.flatMap(\.sortedOutputs).sorted { $0.date > $1.date } }
    var repsLogged: Int { allPacts.map(\.doneCount).reduce(0, +) }
    var operationalizedOutputs: Int { allOutputs.filter(\.isOperationalized).count }
}
