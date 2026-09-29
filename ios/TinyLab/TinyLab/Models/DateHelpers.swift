import Foundation

extension Date {
    var startOfDay: Date { Calendar.current.startOfDay(for: self) }

    func adding(days: Int) -> Date {
        Calendar.current.date(byAdding: .day, value: days, to: self) ?? self
    }

    /// Whole calendar days from `from` to `to` (negative if `to` is earlier).
    static func daysBetween(_ from: Date, _ to: Date) -> Int {
        Calendar.current.dateComponents([.day], from: from.startOfDay, to: to.startOfDay).day ?? 0
    }

    var isToday: Bool { Calendar.current.isDateInToday(self) }
    var isFuture: Bool { startOfDay > Date.now.startOfDay }
}
