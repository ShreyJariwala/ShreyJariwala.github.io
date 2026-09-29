import SwiftUI

struct StatTile: View {
    let value: String
    let label: String

    var body: some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.title3.weight(.bold))
                .monospacedDigit()
            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
    }
}

struct StatusBadge: View {
    let status: PactStatus

    var body: some View {
        Label(status.label, systemImage: status.symbol)
            .font(.caption.weight(.semibold))
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(Capsule().fill(Color.accentColor.opacity(0.15)))
    }
}

/// Big round did / didn't button used on the Today screen.
struct LogButton: View {
    let symbol: String
    let tint: Color
    let isOn: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: symbol)
                .font(.body.weight(.bold))
                .frame(width: 44, height: 44)
                .foregroundStyle(isOn ? Color.white : tint)
                .background(Circle().fill(isOn ? tint : tint.opacity(0.12)))
        }
        .buttonStyle(.borderless)
    }
}

/// One square in a pact's day grid.
struct DayCell: View {
    let day: Date
    let state: Bool?
    let hasNote: Bool

    private var fill: Color {
        switch state {
        case .some(true): .green
        case .some(false): .red.opacity(0.75)
        case .none: Color(.systemGray5)
        }
    }

    var body: some View {
        Text("\(Calendar.current.component(.day, from: day))")
            .font(.caption2.weight(.semibold))
            .monospacedDigit()
            .frame(maxWidth: .infinity, minHeight: 34)
            .foregroundStyle(state == nil ? Color.secondary : Color.white)
            .background(RoundedRectangle(cornerRadius: 6).fill(fill))
            .overlay(alignment: .topTrailing) {
                if hasNote {
                    Circle().fill(Color.white).frame(width: 5, height: 5).padding(3)
                }
            }
            .overlay(
                RoundedRectangle(cornerRadius: 6)
                    .stroke(day.isToday ? Color.primary : Color.clear, lineWidth: 2)
            )
            .opacity(day.isFuture ? 0.35 : 1)
    }
}

/// Identifiable wrapper so a day can drive `.sheet(item:)`.
struct DayRef: Identifiable {
    let date: Date
    var id: Date { date }
}

extension Double {
    var percent: String { "\(Int((self * 100).rounded()))%" }

    var compact: String {
        self == rounded() ? String(Int(self)) : String(format: "%.1f", self)
    }
}
