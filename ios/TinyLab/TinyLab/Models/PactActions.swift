import Foundation
import SwiftData

/// Mutations shared by the Today list, the detail grid, and the review flow.
extension Pact {
    /// Log a day as done / not done. Creates or updates that day's check-in.
    @discardableResult
    func log(_ didIt: Bool, on date: Date = .now, in context: ModelContext) -> CheckIn {
        if let existing = checkIn(on: date) {
            existing.didIt = didIt
            if didIt { existing.missReasonRaw = "" }
            return existing
        }
        let entry = CheckIn(day: date, didIt: didIt)
        context.insert(entry)
        entry.pact = self
        return entry
    }

    func clearLog(on date: Date, in context: ModelContext) {
        if let existing = checkIn(on: date) {
            context.delete(existing)
        }
    }

    /// Grid tap: nothing -> done -> missed -> nothing.
    func cycleLog(on date: Date, in context: ModelContext) {
        switch checkIn(on: date)?.didIt {
        case .none: log(true, on: date, in: context)
        case .some(true): log(false, on: date, in: context)
        case .some(false): clearLog(on: date, in: context)
        }
    }

    /// Persist: keep going for another stretch.
    func persist(extraDays: Int) {
        durationDays += max(extraDays, 1)
        decision = .persist
        status = .active
    }

    func pause() {
        decision = .pause
        status = .paused
    }

    func resume() {
        status = .active
        if needsReview == false { decision = .undecided }
    }

    /// Pivot: close this pact and hand back a new, pre-filled one.
    func pivot(in context: ModelContext) -> Pact {
        decision = .pivot
        status = .completed
        let next = Pact(action: action, question: nextStep.isEmpty ? question : nextStep,
                        durationDays: durationDays, startDate: .now, metricName: metricName)
        next.pivotedFromID = id
        context.insert(next)
        next.capability = capability
        return next
    }

    func operationalize(into capability: Capability?, routine: String) {
        self.routine = routine
        self.capability = capability
        operationalizedAt = .now
        if decision == .undecided { decision = .persist }
        status = .operationalized
    }
}
